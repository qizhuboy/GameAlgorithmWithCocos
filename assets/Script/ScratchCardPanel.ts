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

    @property(cc.Label)
    NumLabels: cc.Label[] = [];

    private _size: number = 20; //刮卡路径大小
    private _isPress: boolean = false;
    private _lastPoint: cc.Vec2;
    private _openArena: boolean[] = [];

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.OnTouchBegin, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.OnTouchMoved, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        this.CloseButton.node.on("click", this.OnCloseButtonClick, this);
        this.StartButton.node.on("click", this.OnStartButtonClick, this);

        this.NumLabels.forEach(obj => {
            this._openArena.push(false);
        })
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
        this._lastPoint = null;
    }

    /**绘制函数*/
    AddCircle(point: cc.Vec2) {
        let func = () => {
            let graphics = this.Mask["_graphics"] as cc.Graphics;
            graphics.circle(point.x, point.y, this._size);
            graphics.fill();
            this.CheckIsOverLap(point);
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
                this.CheckIsOverLap(this._lastPoint, point);
            } else {
                func();
            }
        } else {
            func();
        }
        this._lastPoint = point;
    }

    private CheckIsOverLap(point: cc.Vec2, point2?: cc.Vec2) {
        let openCount = 0;
        for (let i = 0; i < this.NumLabels.length; i++) {
            if (this._openArena[i]) {
                openCount++;
                continue;
            }
            const label = this.NumLabels[i];
            let worldPos = label.node.convertToWorldSpaceAR(new cc.Vec2(0, 0));
            let pos = this.node.convertToNodeSpaceAR(worldPos);
            if (!point2) {
                if ((point.x < (pos.x + label.node.width / 2) && point.x > (pos.x - label.node.width / 2)
                    && point.y < (pos.y + label.node.height / 2) && point.y > (pos.y - label.node.height / 2))) {
                    this._openArena[i] = true;
                    openCount++;
                }
            } else {
                let rect = new cc.Rect(pos.x - label.node.width / 2, pos.y - label.node.height / 2, label.node.width, label.node.height);
                let isIntersected = cc.Intersection.lineRect(point, point2, rect);
                if (isIntersected) {
                    this._openArena[i] = true;
                    openCount++;
                }
            }
        }
        if (openCount == this.NumLabels.length) {
            let graphics = this.Mask["_graphics"] as cc.Graphics;
            graphics.rect(this.ShowNode.x - this.ShowNode.width / 2, this.ShowNode.y - this.ShowNode.height / 2, this.ShowNode.width, this.ShowNode.height);
            graphics.fill();
        }
    }

    private OnCloseButtonClick() {
        this.node.destroy();
    }

    private OnStartButtonClick() {
        this._lastPoint = null;
        (this.Mask["_graphics"] as cc.Graphics).clear();
        for (let i = 0; i < this.NumLabels.length; i++) {
            this._openArena[i] = false;
        }
    }

}

