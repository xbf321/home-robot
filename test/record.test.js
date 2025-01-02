import test from 'node:test';

import { PvRecorder } from '@picovoice/pvrecorder-node';

test('RecordDevice', async () => {
  const devices = PvRecorder.getAvailableDevices();
  for (let i = 0; i < devices.length; i++) {
    console.info(`device name: ${devices[i]}, index: ${i}`)
  }
});