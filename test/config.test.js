import test from 'node:test';
import assert from 'node:assert';
import config from '../src/utils/config.js';

test('ConfigTest', async () => {
  assert.strictEqual(config.tts_engine, 'Google');
  assert.strictEqual(config.tencent_asr.secretKey, 'tcCdu0vhJrFSUL2Yu7C7rPkvW5TjqqgL');
});