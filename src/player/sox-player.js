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
    consola.info(`SoxPlayer 停止播放 ${(this.currentProcess && this.currentProcess.pid) || null} 进程`);
    if (!this.currentProcess) {
      return;
    }
    this.currentProcess.kill();
    this.isPlaying = false;
    this.playQueue = [];
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
    const { pid } = this.currentProcess;
    consola.info(`开始播放 ${src}（${pid}）`);
    this.currentProcess.on('close', (code) => {
      this.isPlaying = false;
      // code: 0 播放完毕
      // code: null 中断退出
      consola.info(`${src} 播放完毕（${pid}）`);
      if (code === 0) {
        consola.info(`并调用 callback（${this.currentProcess.pid}）`);
        callback && callback(src);
      }
    });
  }
}

export default SoxPlayer;