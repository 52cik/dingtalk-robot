import sign from './sign';
import fetch, { ResData } from './fetch';

// 开发文档 https://ding-doc.dingtalk.com/doc#/serverapi2/qf2nxq

const host = 'https://oapi.dingtalk.com/robot/send';

interface AtInfo {
  /** 需要 @ 的手机号数组 */
  atMobiles?: string[];
  /** 是否 @ 所有人 */
  isAtAll?: boolean;
}

interface LinkOption {
  /** 消息标题 */
  title: string;
  /** 消息内容，如果太长只会部分展示 */
  text: string;
  /** 图片URL */
  picUrl?: string;
  /** 点击消息跳转的URL */
  messageUrl: string;
}

interface ActionCardOptionSingle {
  /** 首屏会话透出的展示内容 */
  title: string;
  /** markdown 格式的消息 */
  text: string;
  /** 单个按钮的标题。(设置此项和singleURL后btns无效) */
  singleTitle: string;
  /** 点击singleTitle按钮触发的URL */
  singleURL: string;
  /** 0-按钮竖直排列，1-按钮横向排列 */
  btnOrientation?: 0 | 1;
}

interface ActionCardOptionBtns {
  /** 首屏会话透出的展示内容 */
  title: string;
  /** markdown 格式的消息 */
  text: string;
  /** 0-按钮竖直排列，1-按钮横向排列 */
  btnOrientation?: 0 | 1;
  /** 按钮数组 */
  btns: {
    /** 按钮标题 */
    title: string;
    /** 点击按钮触发的URL */
    actionURL: string;
  }[];
}

interface FeedLinkItem {
  /** 单条信息文本 */
  title: string;
  /** 点击单条信息到跳转链接 */
  messageURL: string;
  /** 单条信息后面图片的URL */
  picURL: string;
}

interface DingtalkRobotOption {
  /** 钉钉机器人 Webhook 中的 access_token */
  accessToken: string;
  /** 如果选择加签模式，这里填写秘钥 (函数计算不推荐加签，浪费算力) */
  secret?: string;
}

function atInfo(at?: boolean | string[] | AtInfo): AtInfo {
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
function send(target: any, data: any): Promise<ResData> {
  let signStr = '';
  if (target.secret) {
    const timestamp = Date.now();
    signStr = `&timestamp=${timestamp}&sign=${sign(
      target.secret,
      `${timestamp}\n${target.secret}`,
    )}`;
  }
  const postData = JSON.stringify(data);
  return fetch(target.webhook + signStr, postData);
}

class DingtalkRobot {
  webhook: string;

  secret: string;

  constructor({ accessToken = '', secret = '' }: DingtalkRobotOption) {
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
  text(content: string, at?: boolean | string[] | AtInfo): Promise<ResData> {
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
  link(data: LinkOption): Promise<ResData> {
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
  markdown(title: string, text: string, at?: boolean | string[] | AtInfo): Promise<ResData> {
    return send(this, {
      msgtype: 'markdown',
      markdown: { title, text },
      at: atInfo(at),
    });
  }

  /**
   * 整体跳转ActionCard类型
   * @param card 卡片选项
   *
   * @example
   *
   * ```js
   * await robot.actionCard({
   *   title: '标题',
   *   text: 'markdown 格式的内容',
   *   btnOrientation: 0,
   *   singleTitle: '跳转按钮标题',
   *   singleURL: '跳转链接',
   * });
   * ```
   */
  actionCard(card: ActionCardOptionSingle): Promise<ResData>;
  /**
   * 独立跳转ActionCard类型
   * @param card 卡片选项
   *
   * @example
   *
   * ```js
   * await robot.actionCard({
   *   title: '标题',
   *   text: 'markdown 格式的内容',
   *   btnOrientation: 0,
   *   btns: [
   *     {
   *       title: '跳转按钮1',
   *       actionURL: '跳转地址1',
   *     },
   *     {
   *       title: '跳转按钮2',
   *       actionURL: '跳转地址2',
   *     },
   *   ],
   * });
   * ```
   */
  actionCard(card: ActionCardOptionBtns): Promise<ResData>;
  actionCard(card: ActionCardOptionSingle | ActionCardOptionBtns): Promise<ResData> {
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
  feedCard(links: FeedLinkItem[]): Promise<ResData> {
    return send(this, {
      msgtype: 'feedCard',
      feedCard: { links },
    });
  }
}

export default DingtalkRobot;
