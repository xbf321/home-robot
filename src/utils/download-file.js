import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const info = new URL(url);
    const httpClient = info.protocol === 'https:' ? https : http;
    const options = {
      host: info.host,
      path: `${info.pathname}${info.search}`,
      // headers: {
      //   'user-agent': 'WHAT_EVER',
      // },
    };
    httpClient
      .get(options, (res) => {
        // check status code
        if (res.statusCode !== 200) {
          const msg = `request to ${url} failed, status code = ${res.statusCode} (${res.statusMessage})`;
          reject(new Error(msg));
          return;
        }

        const file = fs.createWriteStream(dest);
        file.on('finish', function () {
          // close() is async, call resolve after close completes.
          file.close(resolve);
        });
        file.on('error', function (err) {
          // Delete the file async. (But we don't check the result)
          fs.unlink(dest);
          reject(err);
        });

        res.pipe(file);
      })
      .on('error', (err) => {
        reject(err);
      })
      .end();
  });
}

export default downloadFile;
