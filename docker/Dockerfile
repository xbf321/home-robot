FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y sox ffmpeg libsox-fmt-all alsa-utils vim

COPY ./asound.conf /etc/asound.conf

RUN git clone https://github.com/xbf321/home-robot.git .

RUN npm config set registry https://registry.npmmirror.com

RUN npm install
