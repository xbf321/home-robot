import test from 'node:test';

import { Porcupine, BuiltinKeyword } from '@picovoice/porcupine-node';
import { PvRecorder } from '@picovoice/pvrecorder-node';

import config from '../src/utils/config.js';

test('RecordDevice', async () => {
  const devices = PvRecorder.getAvailableDevices();
  for (let i = 0; i < devices.length; i++) {
    console.info(`device name: ${devices[i]}, index: ${i}`)
  }
  new Porcupine(
    config.porcupine.accessKey,
    [BuiltinKeyword.HEY_GOOGLE],
    [0.5]
  );
});