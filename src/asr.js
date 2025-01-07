import fs from 'fs-extra';
import tencentcloud from 'tencentcloud-sdk-nodejs';

import { ASRProvider } from './utils/constant.js';
import config from './utils/config.js';

class AbstractASR {
  constructor() {}
}

class Tencent extends AbstractASR {
  constructor() {
    super();
    const AsrClient = tencentcloud.asr.v20190614.Client;
    this.client = new AsrClient({
      credential: {
        secretId: config.asr.provider.tencent.secretId,
        secretKey: config.asr.provider.tencent.secretKey,
      },
      profile: {
        httpProfile: {
          endpoint: 'asr.tencentcloudapi.com',
        },
      },
    });
  }
  // https://cloud.tencent.com/document/api/1093/35646
  async transcribe(audioFile) {
    const content = fs.readFileSync(audioFile).toString('base64');
    if (!content) {
      return '';
    }
    const params = {
      EngSerViceType: '16k_zh',
      SourceType: 1,
      VoiceFormat: 'wav',
      Data: content,
    };
    const response = await this.client.SentenceRecognition(params);
    if (response.Error) {
      throw new Error(response.Error.Message);
    }
    return response.Result || '';
  }
}

class ASRFactory {
  static createInstance(providerName = ASRProvider.Tencent) {
    let provider = null;
    switch (providerName) {
      case ASRProvider.Tencent:
        provider = new Tencent();
        break;
      default:
        provider = null;
        break;
    }
    if (!provider) {
      throw new Error('ASR is null.');
    }
    return provider;
  }
}

export default ASRFactory;