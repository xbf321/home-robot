import path from 'node:path';
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { consola } from 'consola';
import { Porcupine, BuiltinKeyword } from '@picovoice/porcupine-node';
import { PvRecorder } from '@picovoice/pvrecorder-node';

import config from './utils/config.js';
import { ASSETS_DIR } from './utils/constant.js';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const rl = readline.createInterface({ input, output });

class Detector {
  constructor() {
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
  readlineTest(robot) {
    rl.on('line', async (query) => {
      if (!query) {
        return;
      }
      consola.log(`Received: ${query}`);
      await delay(500);
      consola.info("Detected wake word");
      robot.conversation.interrupt();
      robot.conversation.doResponse(query);
    });
  }
  async init(robot) {
    this.readlineTest(robot);
    return;
    const handle = new Porcupine(
      config.porcupine.accessKey,
      [BuiltinKeyword.HEY_GOOGLE],
      [0.5]
    );
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
        robot.conversation.play(path.join(ASSETS_DIR, ['iamhere.wav', 'here.wav'][Math.floor(Math.random() * 2)]));
        await delay(500);
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