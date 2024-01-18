const { ccclass, property } = cc._decorator;

@ccclass
export default class ScratchCardPanel extends cc.Component {

    @property(cc.Node)
    ShowNode: cc.Node = null;

    @property(cc.Mask)
    Mask: cc.Mask = null;

    @property(cc.Button)
    CloseButton: cc.Button = null;

    @property(cc.Button)
    StartButton: cc.Button = null;

    private _size: number = 20; //刮卡路径大小
    private _isPress: boolean = false;
    private _isOpen: boolean = false;
    private _lastPoint: cc.Vec2;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.OnTouchBegin, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.OnTouchMoved, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        this.CloseButton.node.on("click", this.OnCloseButtonClick, this);
        this.StartButton.node.on("click", this.OnStartButtonClick, this);
    }

    OnTouchBegin(event: cc.Event.EventTouch) {
        this._isPress = true;
        let point = event.touch.getLocation();
        point = this.node.convertToNodeSpaceAR(point);
        this.AddCircle(point);
    }

    OnTouchMoved(event: cc.Event.EventTouch) {
        if (!this._isPress) {
            return;
        }
        let point = event.touch.getLocation();
        point = this.node.convertToNodeSpaceAR(point);
        this.AddCircle(point);
    }

    OnTouchEnd(event) {
        this._isPress = false;
        if (this._isOpen) {
            this._isOpen = false;
            let graphics = this.Mask["_graphics"] as cc.Graphics;
            graphics.rect(this.ShowNode.x - this.ShowNode.width / 2, this.ShowNode.y - this.ShowNode.height / 2, this.ShowNode.width, this.ShowNode.height);
            graphics.fill();
        }
    }

    /**绘制函数*/
    AddCircle(point: cc.Vec2) {
        if (!this.CheckIsInMaskNode(point)) {
            this._lastPoint = null;
            return;
        }
        let func = () => {
            let graphics = this.Mask["_graphics"] as cc.Graphics;
            graphics.circle(point.x, point.y, this._size);
            graphics.fill();
        }
        if (this._lastPoint) {
            let temp = this._lastPoint.sub(point);
            let dis = Math.abs(temp.mag());
            if (dis > this._size * 2) {
                let graphics = this.Mask["_graphics"] as cc.Graphics;
                graphics.moveTo(this._lastPoint.x, this._lastPoint.y);
                graphics.lineTo(point.x, point.y);
                graphics.lineWidth = this._size * 2;
                graphics.strokeColor = cc.Color.WHITE;
                graphics.stroke();
            } else {
                func();
            }
        } else {
            func();
        }
        this._isOpen = true;
        this._lastPoint = point;
    }

    private CheckIsInMaskNode(point: cc.Vec2) {
        return (point.x < (this.ShowNode.x + this.ShowNode.width / 2) && point.x > (this.ShowNode.x - this.ShowNode.width / 2)
            && point.y < (this.ShowNode.y + this.ShowNode.height / 2) && point.y > (this.ShowNode.y - this.ShowNode.height / 2));
    }

    private OnCloseButtonClick() {
        this.node.destroy();
    }

    private OnStartButtonClick() {
        this._lastPoint = null;
        (this.Mask["_graphics"] as cc.Graphics).clear();
    }

}

