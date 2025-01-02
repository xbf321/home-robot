import path from 'node:path';
import { consola } from 'consola';
import { Porcupine, BuiltinKeyword } from '@picovoice/porcupine-node';
import { PvRecorder } from '@picovoice/pvrecorder-node';

import config from './utils/config.js';
import { ASSETS_DIR } from './utils/constant.js';

class Detector {
  constructor() {
    const handle = new Porcupine(
      config.porcupine.accessKey,
      [BuiltinKeyword.HEY_GOOGLE],
      [0.5]
    );
    this.handle = handle;
    const devices = PvRecorder.getAvailableDevices();
    for (let i = 0; i < devices.length; i++) {
      consola.info(`device name: ${devices[i]}, index: ${i}`)
    }
  }
  static getInstance() {
    if (!Detector.instance) {
      Detector.instance = new Detector()
    }
    return Detector.instance;
  }
  async init(robot) {
    const audioDeviceIndex = config.audio_device_index;
    const frameLength = this.handle.frameLength;

    const isInterrupted = false;

    const recorder = new PvRecorder(frameLength, audioDeviceIndex);
    recorder.start();
    consola.info('Init Detector');
    consola.info(`Using device: ${recorder.getSelectedDevice()}...`);
    consola.info("Listening for wake word(s)");

    while (!isInterrupted) {
      const pcm = await recorder.read();
      let index = this.handle.process(pcm);
      
      if (index !== -1) {
        await robot.conversation.play(path.join(ASSETS_DIR, ['iamhere.wav', 'here.wav'][Math.floor(Math.random() * 2)]));
        consola.info("Detected wake word");
        recorder.stop();
        robot.conversation.interrupt();
        const query = await robot.conversation.activeListen();
        robot.conversation.doResponse(query);
        recorder.start();
      }
    }
    consola.info("Stopping...");
    recorder.release();
  }
}

export default Detector;