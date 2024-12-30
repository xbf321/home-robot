import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { EdgeTTS } from 'node-edge-tts';
import * as googleTTS from 'google-tts-api';

import downloadFile from './utils/delete-file.js';
import { TTSProvider, TMP_DIR } from './utils/constant.js';

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