# home-robot
 

## Docker 部署

```
docker run -it --rm --privileged --device /dev/snd node:20 bash
```

```
ffmpeg -i test.wav -ar 16000 -ac 1 test2.wav

export AUDIODEV=hw:2,0

docker build -t home-robot .

wget http://m10.music.126.net/20241231151217/cb633df0f796c005eddfca219082ebd7/ymusic/5353/0f0f/0358/d99739615f8e5153d77042092f07fd77.mp3?vuutv=cHYaNnVuELG1U817zJDPa/tUykT+U53Wz7kIbKYd4QURJg2G2u9Ckv8AikXFHqiTN1XMQjhEK24JZQOQvo+TxmY/Jh32CW4hi38iaHW/pwn4CUWhz72JH8keitWyUy9CN9X0qZtMuA09QHMl4f+5UA== -O test-mp3.mp3

wget https://download.samplelib.com/wav/sample-12s.wav -O test.wav
```