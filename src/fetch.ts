import https from 'https';

export interface ResData {
  /** 错误码 */
  errcode: number;
  /** 具体错误信息 */
  errmsg: string;
}

function fetch(url: string, postData: string): Promise<ResData> {
  return new Promise((resolve, reject) => {
    const option = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    // setTimeout(() => reject(Error('timeout')), 10000);
    const req = https.request(url, option, (res) => {
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (err) {
          err.rawData = rawData;
          reject(err);
        }
      });
    });
    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

export default fetch;
