import test from 'node:test';
import assert from 'node:assert';

import Brain from '../src/brain.js';

test('Brain', async () => {
  const brain = new Brain();
  brain.printPlugins();
});