#!/bin/bash

# ================================
# Config mặc định
# ================================
DEFAULT_INPUT_DIR="./local-audio"               # thư mục chứa các file .mp3 cần nén
DEFAULT_PROJECT_SUBFOLDER="audio-uploads"       # nơi sẽ chứa file zip trong project
DEFAULT_ZIP_NAME="audio-files.zip"              # tên file zip đầu ra

# ================================
# Nhận đối số từ dòng lệnh (nếu có)
# ================================
INPUT_DIR="${1:-$DEFAULT_INPUT_DIR}"            # Nếu không truyền $1 thì dùng mặc định
ZIP_NAME="${2:-$DEFAULT_ZIP_NAME}"              # Nếu không truyền $2 thì dùng mặc định

# ================================
# Hiển thị log
# ================================
echo "🎧 Input directory: $INPUT_DIR"
echo "🗜️  Output zip name: $ZIP_NAME"
echo "📁 Project folder to copy: $DEFAULT_PROJECT_SUBFOLDER"

# ================================
# Tạo file zip
# ================================
echo "🔍 Tìm file .mp3 trong $INPUT_DIR và tạo $ZIP_NAME..."
zip -j "$ZIP_NAME" "$INPUT_DIR"/*.mp3

# ================================
# Tạo thư mục đích nếu chưa có
# ================================
mkdir -p "$DEFAULT_PROJECT_SUBFOLDER"

# ================================
# Di chuyển file zip vào project
# ================================
mv "$ZIP_NAME" "$DEFAULT_PROJECT_SUBFOLDER"/

# ================================
# Commit và push
# ================================
cd "$(dirname "$0")"  # đảm bảo đang ở root project

echo "📦 Commit & push file $ZIP_NAME..."
git add "$DEFAULT_PROJECT_SUBFOLDER/$ZIP_NAME"
git commit -m "🆕 Add audio zip: $ZIP_NAME"
git push

echo "✅ Đã push file zip lên repository!"
