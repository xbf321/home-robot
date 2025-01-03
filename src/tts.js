import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { EdgeTTS } from 'node-edge-tts';
import * as googleTTS from 'google-tts-api';
import xunfeiTTS from 'xf-tts-socket';
import { consola } from 'consola';

import downloadFile from './utils/download-file.js';
import { TTSProvider, TMP_DIR } from './utils/constant.js';
import config from './utils/config.js';

const AUDIO_EXTENSION = 'wav';
class AbstractTTS {
  constructor() {}
}

class Edge extends AbstractTTS {
  constructor() {
    super();
    this.handle = new EdgeTTS();
  }
  async speech(text) {
    consola.info(`调用 Edge TTS，Text：${text}`);
    const tmpFile = path.join(TMP_DIR, `${uuidv4()}.${AUDIO_EXTENSION}`);
    await this.handle.ttsPromise(text, tmpFile);
    return tmpFile;
  }
}

class Google extends AbstractTTS {
  constructor() {
    super();
  }
  async speech(text) {
    const tmpFile = path.join(TMP_DIR, `${uuidv4()}.${AUDIO_EXTENSION}`);
    const url = googleTTS.getAudioUrl(text, {
      lang: 'zh-TW',
      slow: false,
      host: 'https://translate.google.com',
    });
    await downloadFile(url, tmpFile);
    return tmpFile;
  }
}
// https://www.xfyun.cn/doc/tts/online_tts/API.html#%E4%B8%9A%E5%8A%A1%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E-business
class Xunfei extends AbstractTTS {
  constructor() {
    super();
  }
  async speech(text) {
    return new Promise((resolve, reject) => {
      const auth = { 
        app_id: config.xunfei_tts.appId,
        app_skey: config.xunfei_tts.apiSecret,
        app_akey: config.xunfei_tts.apiKey,
      };
      const business = {
        aue: 'lame',
        sfl: 1, 
      };
      const tmpFile = path.join(TMP_DIR, `${uuidv4()}.${AUDIO_EXTENSION}`);
      xunfeiTTS(auth, business, text, tmpFile, (err) => {
        if (err) {
          return reject(err);
        }
        resolve(tmpFile);
      });
    });
  }
}

class TTSFactory {
  static createInstance(providerName = TTSProvider.Edge) {
    let provider = null;
    switch (providerName) {
      case TTSProvider.Edge:
        provider = new Edge();
        break;
      case TTSProvider.Google:
        provider = new Google();
        break;
      case TTSProvider.Xunfei:
        provider = new Xunfei();
        break;
      default:
        provider = null;
        break;
    }
    if (!provider) {
      throw new Error('TTS is null.');
    }
    return provider;
  }
}

export default TTSFactory;