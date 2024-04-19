import { WebSocketServer } from "./WebSocket";

const { ccclass, property } = cc._decorator;

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

    @property(cc.Node)
    PanelNode: cc.Node = null;

    protected onLoad(): void {
        this.QuadTreeButton.node.on("click", this.OnQuadTreeButtonClick, this);
        this.AStarButton.node.on("click", this.OnAStarButtonClick, this);
        this.ScratchCardButton.node.on("click", this.OnScratchCardButtonClick, this);
        this.HttpRequestButton.node.on("click", this.OnHttpRequestButtonClick, this);
        this.WebSocketButton.node.on("click", this.OnWebSocketButtonClick, this);
        this.HttpRequestButton.node.active = false;
        this.WebSocketButton.node.active = false;
    }

    private async OnQuadTreeButtonClick() {
        this.LoadPanelToPanelNode("QuadTreePanel");
    }

    private async OnAStarButtonClick() {
        this.LoadPanelToPanelNode("AStarPanel");
    }

    private async OnScratchCardButtonClick() {
        this.LoadPanelToPanelNode("ScratchCardPanel");
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

    private async LoadPanelToPanelNode(path: string) {
        let prefab = await this.LoadPanel<cc.Prefab>(path, cc.Prefab);
        let node = cc.instantiate(prefab);
        node.parent = this.PanelNode;
    }

    private async LoadPanel<T extends cc.Asset>(path: string, type: typeof cc.Asset): Promise<T> {
        return new Promise((resolve, reject) => {
            cc.assetManager.resources.load<T>(path, type, (error: Error, assets: cc.Asset) => {
                if (error) {
                    console.error(`${path} is not exist`);
                } else {
                    resolve(assets as T);
                }
            })
        })
    }

}

