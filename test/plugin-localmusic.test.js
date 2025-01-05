import test from 'node:test';
import assert from 'node:assert';

import LocalMusic from '../src/plugins/local-music.js';

test('PluginLocalMusic', async () => {
  const music = new LocalMusic({});
  music.handle();
});