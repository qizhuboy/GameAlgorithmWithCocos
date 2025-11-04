import BaseUIPanel, { PanelType } from "./BaseUIPanel";

const { ccclass, property } = cc._decorator;
export const wx = window['wx'];

@ccclass
export default class WeChatPanel extends BaseUIPanel {

    @property(cc.Button)
    LoginButton: cc.Button = null;

    @property(cc.Sprite)
    HeadIcon: cc.Sprite = null;

    @property(cc.Button)
    CloseButton: cc.Button = null;

    public SetPanelType() {
        this.panelType = PanelType.Fix;
    }

    onLoad() {
        this.LoginButton.node.on("click", this.OnLoginButtonClick, this);
        this.CloseButton.node.on("click", this.OnCloseButtonClick, this);
    }

    public Display(Params: any[]): void {
        super.Display(Params);

    }

    private OnLoginButtonClick() {
        this.wechatLogin();
    }

    // 微信登录
    wechatLogin() {
        wx.login({
            success: (res) => {
                if (res.code) {
                    cc.log('登录成功，code:', res.code);
                    // 这里应该将code发送到开发者服务器
                    // 服务器用code换取openid和session_key
                    this.getUserInfo();
                } else {
                    cc.error('登录失败:' + res.errMsg);
                }
            },
            fail: (err) => {
                cc.error('微信登录接口调用失败:', err);
            }
        });
    }

    // 获取用户信息
    getUserInfo() {
        // 先检查是否已授权
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接获取用户信息
                    this.fetchUserInfo();
                } else {
                    // 未授权，创建授权按钮
                    this.createUserInfoButton();
                }
            }
        });
    }

    // 创建授权按钮
    createUserInfoButton() {
        let systemInfo = wx.getSystemInfoSync();
        let button = wx.createUserInfoButton({
            type: 'text',
            text: '获取用户信息',
            style: {
                left: (systemInfo.windowWidth - 200) / 2,
                top: systemInfo.windowHeight / 2,
                width: 200,
                height: 40,
                lineHeight: 40,
                backgroundColor: '#07c160',
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 4
            }
        });

        button.onTap((res) => {
            if (res.errMsg === 'getUserInfo:ok') {
                cc.log('用户信息获取成功');
                // 用户信息获取成功，销毁按钮
                button.destroy();
                // 处理用户信息
                this.processUserInfo(res.userInfo);
            } else {
                cc.error('用户拒绝授权:', res.errMsg);
            }
        });
    }

    // 直接获取用户信息（已授权情况）
    fetchUserInfo() {
        wx.getUserInfo({
            openIdList: ['selfOpenId'],
            lang: 'zh_CN',
            success: (res) => {
                cc.log('直接获取用户信息成功:', res);
                this.processUserInfo(res.userInfo);
            },
            fail: (err) => {
                cc.error('获取用户信息失败:', err);
            }
        });
    }

    // 处理用户信息
    processUserInfo(userInfo) {
        // 更新UI显示
        this.updateUserInfoUI(userInfo);
    }

    // 更新用户信息UI
    updateUserInfoUI(userInfo) {

        // 加载并显示头像
        if (userInfo.avatarUrl) {
            this.loadAvatar(userInfo.avatarUrl);
        }
    }

    async loadWechatAvatarWithDownload(avatarUrl): Promise<any> {
        return new Promise((resolve, reject) => {
            // 先通过微信下载API下载图片
            wx.downloadFile({
                url: avatarUrl,
                success: (res) => {
                    if (res.statusCode === 200) {
                        console.log('下载成功，临时路径:', res.tempFilePath);

                        // 使用临时文件路径加载
                        cc.assetManager.loadRemote(res.tempFilePath, (err, texture) => {
                            if (err) {
                                console.error('加载纹理失败:', err);
                                reject(err);
                                return;
                            }
                            console.log('加载纹理成功');
                            resolve(texture);
                        });
                    } else {
                        reject(new Error(`下载失败，状态码: ${res.statusCode}`));
                    }
                },
                fail: (err) => {
                    console.error('下载文件失败:', err);
                    reject(err);
                }
            });
        });
    }

    // 使用示例
    async loadAvatar(url: string) {
        try {
            let texture = await this.loadWechatAvatarWithDownload(url);
            this.scheduleOnce(() => {
                let spriteFrame = new cc.SpriteFrame(texture);
                this.HeadIcon.spriteFrame = spriteFrame;
            })

        } catch (error) {
            console.error('加载头像失败:', error);
        }
    }

    private OnCloseButtonClick() {
        super.Destroy();
    }

}
