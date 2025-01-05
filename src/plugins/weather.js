import { consola } from 'consola';
import { request } from 'urllib';

import BasePlugin from './_base.js';
import config from '../utils/config.js';

class Weather extends BasePlugin {
  NAME = 'weather';
  constructor(robot) {
    super(robot);
  }

  async fetchData(api, key, location) {
    const body = {
      key,
      location,
    };
    consola.info(`Plugin Weather: fetchData: ${JSON.stringify(body)}`);
    const { statusCode, data} = await request(api, {
      data: body,
      dataType: 'json',
    });
    if (statusCode !== 200) {
      throw new Error(statusCode);
    }
    return data;
  }

  async handle(text, parsed) {
    let location = config.plugins.weather.location;
    const accessKey = config.plugins.weather.key;
    const locationParamInfo = this.nlu.getParameter(parsed, 'location');
    if (locationParamInfo) {
      const { kind } = locationParamInfo.city;
      location = locationParamInfo.city[kind];
    }
    
    const WEATHER_API = 'https://api.seniverse.com/v3/weather/daily.json';
    try {
      const response = await this.fetchData(WEATHER_API, accessKey, location);
      if (!response.results || response.results.length === 0) {
        this.say('抱歉，我获取不到天气数据，请稍后再试', {
          cache: true,
        });
        return;
      }
      const { daily, location: locationData } = response.results[0];
      const { text_day, text_night, humidity, high, low } = daily[0];
      // 今天 廊坊，白天 # 晚间
      const msg = `
        今天${locationData.name}，
        白天${text_day}，
        晚间${text_night}，
        气温最高${high}度，
        气温最低${low}度，
        湿度${humidity}`;
      this.say(msg);
    } catch (err) {
      consola.error(err);
      this.say('抱歉，我获取不到天气数据，请稍后再试', {
        cache: true,
      })
    }
  }

  isValid(text, parsed) {
    return this.nlu.hasIntent(parsed, 'USER_WEATHER');
  }
}
export default Weather;