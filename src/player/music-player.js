import fs from 'fs-extra';
import { consola } from 'consola';

import SoxPlayer from './sox-player.js';

class MusicPlayer  extends SoxPlayer {
  pausing = false;
  constructor(playlist) {
    super();
    this.playlist = playlist || [];
    this.index = 0;
  }

  setPlayList(playlist) {
    super.stop();
    this.playlist = playlist;
    this.index = 0;
  }

  play() {
    const filePath = this.playlist[this.index];
    super.stop();
    consola.info(`MusicPlayer 即将播放 ${filePath}`);
    super.play(filePath, () => {
      this.next();
    });
  }

  prev() {
    this.index = (this.index - 1) % this.playlist.length;
    consola.info(`MusicPlayer 执行：上一首 index：${this.index}`);
    this.play();
  }

  next() {
    this.index = (this.index + 1) % this.playlist.length;
    consola.info(`MusicPlayer 执行：下一首 index：${this.index}`);
    this.play();
  }

  pause() {
    this.pausing = true;
    consola.info('MusicPlayer pause');
  }

  resume() {
    consola.info('MusicPlayer resume');
  }
}

export default MusicPlayer;