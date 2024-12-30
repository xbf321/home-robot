import path from 'node:path';
import fs from 'node:fs';
import YAML from 'yaml'

const file = fs.readFileSync(path.join(process.cwd(), './setting.yml'), 'utf8');
const content = YAML.parse(file);
export default content;