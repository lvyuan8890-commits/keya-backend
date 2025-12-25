import { User } from '../models/user';
export interface WechatLoginResult {
    token: string;
    user: User;
    isNewUser: boolean;
}
export declare function wechatMiniProgramLogin(code: string): Promise<WechatLoginResult>;
export declare function getWechatUserInfo(encryptedData: string, iv: string, sessionKey: string): Promise<any>;
//# sourceMappingURL=wechat.d.ts.map