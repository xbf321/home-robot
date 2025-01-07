import Robot from "./src/robot.js";

const robot = Robot();

(async () => {
  try {
    await robot.run();
  } catch (e) {
    console.error(e.toString());
  }
})();