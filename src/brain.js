import { consola } from 'consola';

import config from './utils/config.js';
import WeatherPlugin from './plugins/weather.js';
import LocalMusicPlugin from './plugins/local-music.js';
class Brain {
  constructor(robot) {
    this.robot = robot;
    this.plugins = [
      new WeatherPlugin(robot),
      new LocalMusicPlugin(robot),
    ];
  }

  match(patterns, text) {
    let isMatch = false;
    patterns.forEach((pattern) => {
      if (pattern === text) {
        isMatch = true;
        return;
      }
    });
    return isMatch;
  }

  isValid(plugin, text, parsed) {
    if (!config.plugins[plugin.NAME]) {
      return plugin.isValid(text, parsed);
    }
    const patterns = config.plugins[plugin.NAME].patterns || [];
    if (patterns.length > 0) {
      return plugin.isValid(text, parsed) || this.match(patterns, text);
    }
    return plugin.isValid(text, parsed);
  }

  isValidImmersive(plugin, text, parsed) {
    console.info(config.plugins[plugin.NAME]);
    // const patterns = config.plugins[plugin.NAME].patterns || [];
    // if (patterns.length > 0) {
    //   return plugin.isValidImmersive(text, parsed) || this.match(patterns, text);
    // }
    return plugin.isValidImmersive(text, parsed);
  }

  isImmersive(plugin, text, parsed) {
    return this.robot.conversation.getImmersiveMode() === plugin.NAME  && 
      this.isValidImmersive(plugin, text, parsed)
  }

  async query(text, parsed) {
    const self = this;
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      if (!self.isValid(plugin, text, parsed) && !this.isImmersive(plugin, text, parsed)) {
        continue;
      }
      consola.info(`【${text}】 命中技能 ${plugin.NAME}`);
      this.robot.conversation.setMatchPlugin(plugin.NAME);
      if (plugin.IS_IMMERSIVE) {
        this.robot.conversation.setImmersiveMode(plugin.NAME);
      }
      
      await plugin.handle(text, parsed);
      console.info('调用技能完毕');
      return true;
    }
    return false;
  }

  // 恢复技能
  restore() {
    if (!this.robot.conversation.immersiveMode) {
      return;
    }
    this.plugins.forEach((plugin) => {
      if (this.robot.conversation.immersiveMode === plugin.NAME && plugin.restore) {
        consola.info(`恢复插件：${item.NAME} 技能`);
        plugin.restore();
        return;
      }
    });
  }

  printPlugins() {
    this.plugins.forEach((item) => {
      consola.info(`已激活插件：${item.NAME}`);
    });
  }
}
export default Brain;