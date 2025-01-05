import test from 'node:test';
import assert from 'node:assert';

import NLUFactory from '../src/nlu.js';
import { NLUProvider } from '../src/utils/constant.js';

test('NLUParsed', async () => {
  const nlu = NLUFactory.createInstance(NLUProvider.Dialogflow);

  const parsed = await nlu.parse('下一首');
  console.info(parsed);
});
test('NLUhasIntent', async () => {
  // const nlu = NLUFactory.createInstance(NLUProvider.Dialogflow);

  // const parsed = await nlu.parse('今天北京天气');

  // const hasIntent = nlu.hasIntent(parsed, 'USER_WEATHER');
  // const parameters = nlu.getParameters(parsed);
  // const locationData = nlu.getParameter(parsed, 'location');
  // if (locationData) {
  //   const { kind } = locationData.city;
  //   const location = locationData.city[kind];
  //   console.info(location);
  // }
  // assert.equal(hasIntent, true);
});