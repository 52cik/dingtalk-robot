export interface ResData {
    /** 错误码 */
    errcode: number;
    /** 具体错误信息 */
    errmsg: string;
}
declare function fetch(url: string, postData: string): Promise<ResData>;
export default fetch;
