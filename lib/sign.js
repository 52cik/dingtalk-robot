"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
function sign(secret, content) {
    const str = crypto_1.default.createHmac('sha256', secret).update(content).digest().toString('base64');
    return encodeURIComponent(str);
}
exports.default = sign;
