import test from 'node:test';
import assert from 'node:assert';

import Weather from '../src/plugins/weather.js';

test('Brain', async () => {
  const weather = new Weather({});
  weather.handle();
});