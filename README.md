# whisper-transcription
- b1: mp3 to srt

```shell
./zip_and_push.sh  /Users/huytv/Downloads/#35/voices
```
- b2: audio & srt to video
```shell
zip input_data.zip audio.mp3 timings.json content.txt
```

[link-repo](https://github.com/huy8895/whisper-transcription.git)

để upload được video lên youtube:
- tạo project mới trên google cloud
- tạo client dạng webapplication -> có test là email cần upload video
- vào https://developers.google.com/oauthplayground/
- điền client secret và client id vào
- chọn youtube api v3
- chọn scope là youtube
- authorization code
- copy token