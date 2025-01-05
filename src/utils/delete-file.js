import { consola } from 'consola';
import fs from 'fs-extra';

async function deleteFile(filePath) {
  try {
    await fs.remove(filePath)
  } catch (err) {
    consola.error(err)
  }
}

export default deleteFile;