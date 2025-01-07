import { consola } from 'consola';
import path from 'node:path';
import fs from 'fs-extra';

import Brain from './brain.js';
import SoxPlayer from './player/sox-player.js';
import TTSFactory from './tts.js';
import ASRFactory from './asr.js';
import NLUFactory from './nlu.js';
import Detector from "./detector.js";
import Conversation from "./conversation.js";


import config from './utils/config.js';
import {
  TTSProvider,
  ASRProvider,
  NLUProvider,
  TMP_DIR,
  ASSETS_DIR,
} from './utils/constant.js';

class Robot {
  conversation = null;
  player = null;
  brain = null;
  tts = null;
  asr = null;
  nlu = null;
  constructor() {
    this.tts = TTSFactory.createInstance(TTSProvider[config.tts.engine]);
    this.asr = ASRFactory.createInstance(ASRProvider[config.asr.engine]);
    this.nlu = NLUFactory.createInstance(NLUProvider[config.nlu.engine]);
    this.player = new SoxPlayer();
    this.conversation = new Conversation(this);
    this.brain = new Brain(this);
  }
  static getInstance() {
    if (!Robot.instance) {
      Robot.instance = new Robot();
    }
    return Robot.instance;
  }
  async run() {
    await fs.ensureDir(TMP_DIR);
    Detector.getInstance().init(this);
    consola.info('Robot 初始化完毕');
    this.conversation.play(path.join(ASSETS_DIR, 'beep_hi.wav'));
  }
}

export default Robot.getInstance;