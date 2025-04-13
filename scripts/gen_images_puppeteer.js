const puppeteer = require("puppeteer");
const fs = require("fs-extra");

// Đọc JSON nội dung các slide
const data = JSON.parse(fs.readFileSync("timings.json", "utf8"));

// Đọc ảnh nền và chuyển sang base64
const bgBase64 = fs.readFileSync("assets/bg.jpg", "base64");

const htmlTemplate = (text) => `
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro&display=swap');
    body {
      width: 1920px;
      height: 1080px;
      margin: 0;
      padding: 100px;
      background-image: url("data:image/jpeg;base64,${bgBase64}");
      background-size: cover;
      background-position: center;
      font-family: 'Crimson Pro', serif;
      color: #404040;
      font-size: 38px;
      text-align: justify;
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }
    .text {
      width: 80%;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="text">${text}</div>
</body>
</html>`;

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    for (let i = 0; i < data.length; i++) {
        const html = htmlTemplate(data[i].text);
        const htmlFile = `slides_html/slide_${i + 1}.html`;
        fs.writeFileSync(htmlFile, html);

        await page.setContent(html, { waitUntil: "domcontentloaded" });
        await page.screenshot({ path: `slides_img/slide_${i + 1}.png` });
        console.log(`✅ Slide ${i + 1} captured`);
    }

    await browser.close();
})();
