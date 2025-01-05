import fs from 'fs-extra';
import { consola } from 'consola';
import { spawn } from 'node:child_process';

class SoxPlayer {
  isPlaying = false;
  playQueue = [];
  currentProcess = null;
  constructor() {
    this.playQueue = [];
    this.isPlaying = false;
    this.playLoop();
  }

  play(src, callback = null) {
    const exists = fs.existsSync(src);
    if (!exists) {
      consola.error(`path not exists: ${src}`);
      return;
    }
    consola.info(`追加到播放列表：${src}`);
    this.playQueue.push({
      src,
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
        const { src, callback } = item;
        consola.info(`开始播放音频: ${src}`);
        this.doPlay(src, callback);
      });
    });
  }

  doPlay(src, callback = null) {
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
    this.currentProcess.on('close', () => {
      self.isPlaying = false;
      this.currentProcess = null;
      consola.info('语音播放完毕');
      callback && callback(src);
    });
  }
}

export default SoxPlayer;