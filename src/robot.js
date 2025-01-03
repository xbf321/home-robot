import { consola } from 'consola';
import path from 'node:path';
import fs from 'fs-extra';

import Player from './player.js';
import TTSFactory from './tts.js';
import ASRFactory from './asr.js';
import Detector from "./detector.js";
import Conversation from "./conversation.js";

import config from './utils/config.js';
import { TTSProvider, ASRProvider, TMP_DIR, ASSETS_DIR } from './utils/constant.js';

class Robot {
  constructor() {}
  static getInstance() {
    if (!Robot.instance) {
      Robot.instance = new Robot();
    }
    return Robot.instance;
  }
  async run() {
    await fs.ensureDir(TMP_DIR);
    this.conversation = new Conversation(this);
    this.player = new Player();
    this.tts = TTSFactory.createInstance(TTSProvider[config.tts_engine]);
    this.asr = ASRFactory.createInstance(ASRProvider[config.asr_engine]);
    Detector.getInstance().init(this);
    consola.info('Robot 初始化完毕');
    this.conversation.play(path.join(ASSETS_DIR, 'beep_hi.wav'));
  }
}

export default Robot.getInstance;