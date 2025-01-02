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

  play(src, deleted = false, callback = null) {
    const exists = fs.existsSync(src);
    if (!exists) {
      consola.error(`path not exists: ${src}`);
      return;
    }
    consola.info(`追加到播放列表：${src}`);
    this.playQueue.push({
      src,
      deleted,
      callback,
    });
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
        const item = self.playQueue.shift();
        if (!item) {
          return;
        }
        const { src, deleted, callback } = item;
        consola.info(`开始播放音频: ${src}`);
        this.doPlay(src, deleted, callback);
      });
    });
  }

  doPlay(src, deleted = false, callback = null) {
    const self = this;
    const { platform } = process;
    let cmd;
    let args = []
    if (platform === 'darwin') {
      cmd = 'afplay';
      args = [src];
    } else {
      cmd = 'ffplay';
      args = [src, '-autoexit'];
    }
    self.isPlaying = true;
    this.currentProcess = spawn(cmd, args);
    this.currentProcess.on('close', async () => {
      self.isPlaying = false;
      this.currentProcess = null;
      callback && await callback();

      if (deleted) {
        await deleteFile(src);
        consola.info(`语音已物理删除`);
      }
      consola.info('语音播放完毕');
    });
  }
}

export default Player;