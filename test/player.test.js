import test from 'node:test';
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";


import MusicPlayer from '../src/player/music-player.js';

const rl = readline.createInterface({ input, output });

// test('MusicPlayer', async () => {
  const songList = [
    '/Users/xingbaifang/Music/mp3/a.wav',
    '/Users/xingbaifang/Music/mp3/05.红颜.mp3',
    '/Users/xingbaifang/Music/mp3/06. 萍聚.mp3',
    '/Users/xingbaifang/Music/mp3/02.晴朗.mp3',
  ];
  const player = new MusicPlayer(songList);

  player.play();
  rl.on('line', async (query) => {
    if (!query) {
      return;
    }
    player.next();
  });
  // const player = new Player();
  // player.play('/example/test.wav');
// });