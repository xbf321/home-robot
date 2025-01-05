import fs from 'fs-extra';
import { consola } from 'consola';
import { spawn } from 'node:child_process';

import SoxPlayer from './sox-player.js';

class MusicPlayer  extends SoxPlayer {
  pausing = false;
  constructor(playlist) {
    super();
    this.playlist = playlist;
    this.index = 0;
  }

  play() {
    consola.info('MusicPlayer play');
    const filePath = this.playlist[this.index];
    super.stop();
    super.play(filePath, () => {
      this.next();
    });
  }

  prev() {
    consola.info('MusicPlayer prev');
    super.stop()
    this.index = (this.index - 1) % this.playlist.length;
    self.play()
  }

  next() {
    consola.info('MusicPlayer next');
    this.index = (this.index + 1) % this.playlist.length;
    super.stop();
    this.play();
  }

  pause() {
    this.pausing = true;
    consola.info('MusicPlayer pause');
  }

  resume() {
    consola.info('MusicPlayer resume');
  }

  stop() {
    consola.info('MusicPlayer stop');
  }
}

export default MusicPlayer;