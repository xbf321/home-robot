class BasePlugin {
  constructor(robot) {
    this.robot = robot;
    this.nlu = robot.nlu;
  }

  // 使用TTS说一句话
  say(text, params) {
    this.robot.conversation.say(text, params);
  }
}

export default BasePlugin;