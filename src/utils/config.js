import path from 'node:path';
import fs from 'fs-extra';
import YAML from 'yaml'
import merge from 'lodash.merge';

const parseContent = (configFile) => {
  const filePath = path.join(process.cwd(), 'config', configFile);
  const exists = fs.existsSync(filePath);
  if (!exists) {
    return {};
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return YAML.parse(content);
};

const prodContent = parseContent('setting.yml');
const devContent = parseContent('setting.local.yml');

export default merge(prodContent, devContent);