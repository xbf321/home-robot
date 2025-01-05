import { consola } from 'consola';
import recorder from 'node-record-lpcm16';
import fs from 'fs-extra';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import merge from 'lodash.merge';
import hash from 'object-hash';
import { LRUCache } from 'lru-cache';

import { TMP_DIR, ASSETS_DIR } from './utils/constant.js';
import deleteFile from './utils/delete-file.js';
import stripPunctuation from './utils/strip-punctuation.js';


class Conversation {
  constructor(robot) {
    this.robot = robot;
    this.history = [];
    this.saying = false;
    this.hasPardon = false;
    // 沉浸模式，处于这个模式下，被打断后将自动恢复这个技能
    this.matchPlugin = null;
    this.immersiveMode = null;
    this.lruCache = new LRUCache({
      max: 500
    });
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

  setMatchPlugin(name) {
    this.matchPlugin = name;
  }

  setImmersiveMode(mode) {
    this.immersiveMode = mode;
  }

  getImmersiveMode() {
    return this.immersiveMode;
  }

  // 响应指令
  async doResponse(query) {
    this.interrupt();
    if (query.trim() === '') {
      this.pardon();
      return;
    }
    const lastImmersiveMode = this.immersiveMode;
    const parsed = await this.robot.nlu.parse(query);
    const isMatchSkill = await this.robot.brain.query(query, parsed);
    const isChatMode = false;

    console.info('isMatchSkill', isMatchSkill);
    if(isMatchSkill) {
      // 命中技能
      if (lastImmersiveMode && lastImmersiveMode !== this.matchPlugin) {
        if (this.robot.player.isPlaying) {
          consola.info('等说完再checkRestore');
        } else {
          consola.info('checkRestore');
          this.checkRestore();
        }
      }
    } else {
      // 调用聊天模式
      consola.info('调用聊天模式');
    }
  }

  checkRestore() {
    if (!this.immersiveMode) {
      return;
    }
    consola.info('处于沉浸模式，恢复技能');
    this.robot.brain.restore();
  }

  async pardon() {
    const params = {
      cache: true,
      appendHistory: false,
    };
    if (this.hasPardon) {
      this.hasPardon = false;
      await this.say('没听清呢', params);
      return;
    }
    this.hasPardon = true;
    await this.say('抱歉，刚刚没听清，能再说一遍吗？', params);
  }

  async say(words, params = {}) {
    words = stripPunctuation(words);
    if (!words) {
      return;
    }
    const {
      appendHistory,
      callback,
      cache,
    } = merge({
      cache: false,
      appendHistory: true,
      callback: () => {}
    }, params || {});
    if (appendHistory) {
      this.history.push(words);
    }
    consola.info(`即将朗读语音：${words}`);
    const wordsHashKey = hash(words);
    let audio = null;
    if (cache) {
      audio = this.lruCache.get(wordsHashKey);
      if (!audio) {
        audio = await this.robot.tts.speech(words);
        this.lruCache.set(wordsHashKey, audio);
      }
    } else {
      audio = await this.robot.tts.speech(words);
    }
    this.play(audio, callback);
  }

  async play(audio, callback) {
    return new Promise((resolve) => {
      this.robot.player.play(audio, (src) => {
        if (callback) {
          callback && callback(src);
          resolve();
        } else {
          resolve();
        }
      });
    });
    
  }
}

export default Conversation;