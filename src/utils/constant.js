import path from 'node:path';

const TMP_DIR = path.join(process.cwd(), '.tmp');
const ASSETS_DIR = path.join(process.cwd(), 'assets');

const ASRProvider = {
  Tencent: 'Tencent',
  Google: 'Google',
};

const TTSProvider = {
  Edge: 'Edge',
  Google: 'Google',
  Xunfei: 'Xunfei',
};

const NLUProvider = {
  Dialogflow: 'Dialogflow',
};

export {
  TMP_DIR,
  ASSETS_DIR,
  ASRProvider,
  TTSProvider,
  NLUProvider,
};