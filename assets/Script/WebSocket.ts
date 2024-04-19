export class WebSocketServer {

    private _url: string;
    private _socket: WebSocket;
    private static _Instance: WebSocketServer;

    public static get Instance() {
        if (!this._Instance) {
            this._Instance = new WebSocketServer();
        }
        return WebSocketServer._Instance;
    }

    public Init(url: string) {
        this._url = url;
        if (!this._socket) {
            this._socket = new WebSocket(url);
            this._socket.onopen = this.OnOpen.bind(this);
            this._socket.onmessage = this.OnMessage.bind(this);
            this._socket.onerror = this.OnError.bind(this);
            this._socket.onclose = this.OnClose.bind(this);
        }
    }

    private OnOpen() {
        console.log("链接成功");
    }

    private OnMessage(data) {
        console.log("信息接受成功");
        console.log(data);
    }

    private OnError() {
        console.error("链接异常");
    }

    private OnClose() {
        console.log("链接关闭");
    }

    public SendData(data: ArrayBuffer) {
        if (this._socket && this._socket.readyState == WebSocket.OPEN) {
            this._socket.send(data);
        }
    }

    public CloseSocket() {
        if (this._socket) {
            this._socket.close();
        }
    }

}