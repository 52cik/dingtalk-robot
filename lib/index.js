"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sign_1 = __importDefault(require("./sign"));
const fetch_1 = __importDefault(require("./fetch"));
// 开发文档 https://ding-doc.dingtalk.com/doc#/serverapi2/qf2nxq
const host = 'https://oapi.dingtalk.com/robot/send';
function atInfo(at) {
    if (at === true) {
        return {
            atMobiles: [],
            isAtAll: true,
        };
    }
    if (Array.isArray(at)) {
        return {
            atMobiles: at,
            isAtAll: false,
        };
    }
    return at || {};
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function send(target, data) {
    let signStr = '';
    if (target.secret) {
        const timestamp = Date.now();
        signStr = `&timestamp=${timestamp}&sign=${sign_1.default(target.secret, `${timestamp}\n${target.secret}`)}`;
    }
    const postData = JSON.stringify(data);
    return fetch_1.default(target.webhook + signStr, postData);
}
class DingtalkRobot {
    constructor({ accessToken = '', secret = '' }) {
        this.webhook = `${host}?access_token=${accessToken}`;
        this.secret = secret;
    }
    /**
     * 文本消息
     * @param content 消息内容
     * @param at AT 选项
     *
     * @example
     *
     * ```js
     * await robot.text('我是一条消息'); // 发送消息
     * await robot.text('我是一条消息', true); // 发送消息，并at所有人
     * await robot.text('我是一条消息', ['手机1', '手机2']); // 发送消息，并at指定人
     * ```
     */
    text(content, at) {
        return send(this, {
            msgtype: 'text',
            text: { content },
            at: atInfo(at),
        });
    }
    /**
     * 链接类型消息
     * @param data 链接信息
     *
     * @example
     *
     * ```js
     * await robot.link({
     *   title: '哔哩哔哩 (゜-゜)つロ 干杯', // 标题
     *   text: 'bilibili是国内知名的视频弹幕网站，这里有最及时的动漫新番，最有创意的Up主。', // 内容
     *   picUrl: 'https://s1.hdslb.com/bfs/static/jinkela/space/asserts/icon-auth.png', // 图片 可选
     *   messageUrl: 'https://www.bilibili.com/', // 跳转地址
     * });
     * ```
     */
    link(data) {
        return send(this, {
            msgtype: 'link',
            link: data,
        });
    }
    /**
     * MD类型消息
     * @param title 标题
     * @param text 内容
     * @param at AT 选项
     *
     * @example
     *
     * ```js
     * await robot.markdown('我是标题', '我是 markdown 格式的内容');
     * ```
     */
    markdown(title, text, at) {
        return send(this, {
            msgtype: 'markdown',
            markdown: { title, text },
            at: atInfo(at),
        });
    }
    actionCard(card) {
        return send(this, {
            msgtype: 'actionCard',
            actionCard: card,
        });
    }
    /**
     * FeedCard类型
     * @param links
     *
     * @example
     *
     * ```js
     * await robot.feedCard([
     *   { title: '标题', messageURL: '跳转地址', picURL: '图片' },
     *   { title: '标题', messageURL: '跳转地址', picURL: '图片' },
     * ]);
     * ```
     */
    feedCard(links) {
        return send(this, {
            msgtype: 'feedCard',
            feedCard: { links },
        });
    }
}
exports.default = DingtalkRobot;
