"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
function fetch(url, postData) {
    return new Promise((resolve, reject) => {
        const option = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
            },
        };
        // setTimeout(() => reject(Error('timeout')), 10000);
        const req = https_1.default.request(url, option, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(rawData));
                }
                catch (err) {
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
exports.default = fetch;
