import { consola } from 'consola';
import path from 'node:path';
import { glob } from 'glob'

import MusicPlayer from '../player/music-player.js';
import BasePlugin from './_base.js';
import config from '../utils/config.js';

class LocalMusic extends BasePlugin {
  NAME = 'local-music';
  // 这是个沉浸式技能
  IS_IMMERSIVE = true;
  constructor(robot) {
    super(robot);
    this.player = null;
    this.songList = [];
  }

  async init() {
    const pattern = path.join(config.plugins.local_music.path, '*.{mp3,wav}');
    this.songList = await glob([pattern]);
    this.player = new MusicPlayer(this.songList);
    console.info('local-music init');
  }

  async matchIntens(parsed) {
    let isValid = false;
    const intens = [
      'PLAY',
      'CHANGE_TO_NEXT',
      'CHANGE_TO_PREV',
      'CLOSE_MUSIC',
    ];
    intens.forEach((item) => {
      isValid = this.nlu.hasIntent(parsed, item);
      if (isValid) {
        return;
      }
    });
    return isValid;
  }

  async handle(text, parsed) {
    if (!this.player) {
      await this.init();
    }
    if (this.songList.length === 0) {
      this.say("本地音乐目录并没有音乐文件，播放失败")
      return;
    }
    if (this.nlu.hasIntent(parsed, 'PLAY')) {
      this.player.play();
    } else if (this.nlu.hasIntent(parsed, 'CHANGE_TO_NEXT')) {
      this.player.next();
    } else if (this.nlu.hasIntent(parsed, 'CHANGE_TO_PREV')) {
      this.player.prev();
    } else if (this.nlu.hasIntent(parsed, 'CLOSE_MUSIC')) {
      this.player.stop();
    } else {
      this.say("没听懂你的意思呢，要停止播放，请说停止播放")
      this.player.resume()
    }
  }
  isValidImmersive(text, parsed) {
    return this.matchIntens(parsed);
  }
  restore() {
    consola.info('执行');
    if (this.player && this.player.pausing) {
      this.player.resume();
    }
  }
  pause() {
    const { platform } = process;
    this.player.pause();
    // BigSur 以上 Mac 系统的 pkill 无法正常暂停音频，
    // 因此改成直接停止播放
    // if (platform === 'darwin' && ) {}
    // if system == "Darwin" and float(platform.mac_ver()[0][:5]) >= 10.16:
    //             logger.warning("注意：Mac BigSur 以上系统无法正常暂停音频，将停止播放，不支持恢复播放")
    //             self.player.stop()
    //             return
    //         self.player.pause()
  }
  isValid(text, parsed) {
    return this.matchIntens(parsed);
  }
}
export default LocalMusic;