import fs from 'fs-extra';
import { consola } from 'consola';
import path from 'node:path';
import { spawn } from 'node:child_process';

import deleteFile from './utils/delete-file.js';

class Player {
  isPlaying = false;
  playQueue = [];
  currentProcess = null;
  constructor() {
    this.playQueue = [];
    this.isPlaying = false;
    this.playLoop();
  }

  static getInstance() {
    if (!Player.instance) {
      Player.instance = new Player();
    }
    return Player.instance;
  }

  async play(src) {
    consola.info(`追加到播放列表：${src}`);
    try {
      await fs.ensureFile(src);
      this.playQueue.push(src);
    } catch(err) {
      consola.error(`path not exists: ${src}`);
    }
  }

  stop() {
    if (!this.currentProcess) {
      return;
    }
    this.currentProcess.kill('SIGHUP');
    this.isPlaying = false;
    this.playQueue = [];
    consola.info('停止播放');
  }

  async playLoop() {
    const self = this;
    process.nextTick(() => {
      setInterval(() => {
        if (self.isPlaying)  {
          return;
        }
        const src = self.playQueue.shift();
        if (!src) {
          return;
        }
        consola.info(`开始播放音频: ${src}`);
        this.doPlay(src);
      }, 1000);
    });
  }

  doPlay(src) {
    const self = this;
    const { platform } = process;
    let cmd;
    let args = []
    if (platform === 'darwin') {
      cmd = 'afplay';
      args = [src];
    } else {
      cmd = 'play';
      args = [src, '-t', 'alsa'];
    }
    self.isPlaying = true;
    this.currentProcess = spawn(cmd, args);
    this.currentProcess.on('close', async () => {
      self.isPlaying = false;
      this.currentProcess = null;
      consola.info('语音播放完毕');
      // await deleteFile(src);
    });
  }
}

export default Player;