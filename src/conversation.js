import { consola } from 'consola';
import recorder from 'node-record-lpcm16';
import fs from 'fs-extra';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

import { TMP_DIR, ASSETS_DIR } from './utils/constant.js';
import deleteFile from './utils/delete-file.js';

class Conversation {
  constructor(robot) {
    this.robot = robot;
    this.history = [];
    this.saying = false;
    this.hasPardon = false;
  }
  interrupt() {
    if (this.robot.player.isPlaying) {
      this.robot.player.stop();
    }
  }
  // 主动问一个问题
  async activeListen() {
    consola.info('进入主动聆听...');
    const voice = await this.recordSound();
    const query = await this.robot.asr.transcribe(voice);
    await deleteFile(voice);
    return query;
  }

  async recordSound() {
    consola.info('开始录制声音...');
    const fileName = path.join(TMP_DIR, `${uuidv4()}.wav`);
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(fileName, { encoding: 'binary' });
      let isEnd = false;
      const pcm = recorder.record({
        threshold: 2,
        sampleRate: 44100,
        endOnSilence: true,
      });
      pcm.stream().on('end', () => {
        pcm.stop();
        consola.info('结束录制');
        isEnd = true;
        resolve(fileName);
      }).on('error', (err) => {
        isEnd = true;
        pcm.stop();
        consola.error(err);
        reject();
      }).pipe(file);
      setTimeout(() => {
        if (isEnd) {
          return;
        }
        pcm.stop();
        consola.info('录制超时，结束录制');
        resolve(fileName);
      }, 15000);
    });
  }

  // 响应指令
  async doResponse(query) {
    this.interrupt();
    if (query.trim() === '') {
      this.pardon();
      return;
    }
    consola.info(`响应指令...，指令是：${query}`);
    await this.say(`您说的是：${query}`);
  }

  async pardon() {
    if (this.hasPardon) {
      this.hasPardon = false;
      await this.say('没听清呢');
      return;
    }
    this.hasPardon = true;
    await this.say('抱歉，刚刚没听清，能再说一遍吗？');
  }

  async say(words, appendHistory = true) {
    if (!words) {
      return;
    }
    if (appendHistory) {
      this.history.push(words);
    }
    consola.info(`即将朗读语音：${words}`);
    const audio = await this.robot.tts.speech(words);
    this.play(audio);
  }

  async play(audio) {
    this.robot.player.play(audio);
  }
}

export default Conversation;