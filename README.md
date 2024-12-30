# home-robot
 

## Docker

```
docker run -it --rm --privileged --device /dev/snd node:20 bash
```

```
apt-get update && apt-get install -y sox
wget pulseaudio ffmpeg libsox-fmt-all
ffmpeg -i test.wav -ar 16000 -ac 1 test2.wav

play test2.wav -t alsa

wget https://m10.music.126.net/20241224183138/44c343135ef1c4d7be14bc060848a0b2/ymusic/9fd6/e885/8285/9a7d1ab14d3e61c3335143ee16deb271.mp3?vuutv=UZG1OcNKZ8NMrmAQVdUq0IlBq7xctSvCvhH/Fcw5wyEMnDB18E1sPOjE7/zdsFp/Kum7NblOttNE4raiJ6obHczikwhk58uvHPFKWkvMSwUuY58sJT6KANdCTgfx1p6MHi44YV5UeBy8ykI2Jtxp1Q== -O love.mp3

wget https://download.samplelib.com/wav/sample-12s.wav -O test.wav
```