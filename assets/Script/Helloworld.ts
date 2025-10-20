import UIManager from "./UIManager";
import { WebSocketServer } from "./WebSocket";

const { ccclass, property } = cc._decorator;

declare global {
    interface Window {
        Helloworld:any;
    }
}

export const wx = window['wx'];

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Button)
    QuadTreeButton: cc.Button = null;

    @property(cc.Button)
    AStarButton: cc.Button = null;

    @property(cc.Button)
    ScratchCardButton: cc.Button = null;

    @property(cc.Button)
    HttpRequestButton: cc.Button = null;

    @property(cc.Button)
    WebSocketButton: cc.Button = null;

    @property(cc.Button)
    PhysicsButton: cc.Button = null;

    @property(cc.Button)
    OpenPhoneAlbum: cc.Button = null;

    @property(cc.Node)
    FixNode: cc.Node = null;

    @property(cc.Node)
    PopUpNode: cc.Node = null;

    @property(cc.Sprite)
    HeadIcon: cc.Sprite = null;

    public static OnImageShow: Function;

    protected onLoad(): void {
        this.QuadTreeButton.node.on("click", this.OnQuadTreeButtonClick, this);
        this.AStarButton.node.on("click", this.OnAStarButtonClick, this);
        this.ScratchCardButton.node.on("click", this.OnScratchCardButtonClick, this);
        this.HttpRequestButton.node.on("click", this.OnHttpRequestButtonClick, this);
        this.WebSocketButton.node.on("click", this.OnWebSocketButtonClick, this);
        this.PhysicsButton.node.on("click", this.OnPhysicsButtonClick, this);
        this.OpenPhoneAlbum.node.on("click", this.OnOpenPhoneAlbumClick, this);
        this.HttpRequestButton.node.active = false;
        this.WebSocketButton.node.active = false;
        Helloworld.OnImageShow = this.ShowSelectImage.bind(this);
    }

    private async OnQuadTreeButtonClick() {
        UIManager.Instance.ShowUIPanel("QuadTreePanel");
    }

    private async OnAStarButtonClick() {
        UIManager.Instance.ShowUIPanel("AStarPanel");
    }

    private async OnScratchCardButtonClick() {
        UIManager.Instance.ShowUIPanel("ScratchCardPanel", "testParam");
    }

    private OnHttpRequestButtonClick() {
        let url = "http://10.1.1.49:8080/person2/"; //需要本地起服务跑起来项目,后端的代码暂时没公开
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                console.log(response);
            }
        };
        xhr.onerror = function (evt) {
            console.log(evt);
        }
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        let nameObj = { "name": "猪八戒" };
        xhr.send(JSON.stringify(nameObj));
    }

    private OnWebSocketButtonClick() {
        WebSocketServer.Instance.Init('ws://10.1.1.49:30001');
        let data = { 
            name: "Hello World"
        };
        const jsonString = JSON.stringify(data);
        const buffer = new ArrayBuffer(jsonString.length * 2);
        const dataView = new Uint16Array(buffer);

        for (let i = 0; i < jsonString.length; i++) {
            dataView[i] = jsonString.charCodeAt(i);
        }
        // 发送二进制流
        WebSocketServer.Instance.SendData(buffer);
    }

    private OnPhysicsButtonClick() {
        UIManager.Instance.ShowUIPanel("PhysicsPanel");
    }

    private OnOpenPhoneAlbumClick() {
        // if (cc.sys.os === cc.sys.OS_ANDROID) {
        //     console.log("开始调用安卓方法");
        //     jsb.reflection.callStaticMethod(
        //         "org.cocos2dx.javascript.AppActivity",
        //         "chooseImage",
        //         "()V"
        //     );
        // }
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
            this.loadRemoteImage(userInfo.avatarUrl, (texture) => {
                let spriteFrame = new cc.SpriteFrame(texture);
                this.HeadIcon.spriteFrame = spriteFrame;
            });
        }
    }

    // 加载远程图片
    loadRemoteImage(url, callback) {
        cc.assetManager.loadRemote(url, (err, texture) => {
            if (err) {
                cc.error('加载头像失败:', err);
                return;
            }
            callback(texture);
        });
    }

    public static onImageSelected(uri) {
        console.log("选择图片uri:" + uri);
        cc.loader.load({ url: uri}, (err, texture) => {
            if (!err) {
                console.log("图片加载成功");
                let spriteFrame = new cc.SpriteFrame(texture);
                Helloworld.OnImageShow(spriteFrame);
            } else {
                console.log("图片加载失败");
            }
        });
    }

    private ShowSelectImage(image: cc.SpriteFrame) {
        console.log("设置图片成功");
        this.HeadIcon.spriteFrame = image
    }

}

window.Helloworld = Helloworld;

