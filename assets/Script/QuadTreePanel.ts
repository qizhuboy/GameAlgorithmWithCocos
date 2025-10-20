import BaseUIPanel, { PanelType } from "./BaseUIPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class QuadTreePanel extends BaseUIPanel {

    @property(cc.Node)
    Parent: cc.Node = null;

    @property(cc.Label)
    FoundCount: cc.Label = null;

    @property(cc.Button)
    CloseButton: cc.Button = null;

    private readonly CircleCount = 400; //创建圆圈数量
    private _circleNodes: cc.Node[]; //所有圆圈节点
    private _maxWidth: number;
    private _maxHeight: number;
    private _moveNode: cc.Node;
    private _isStartMove: boolean;
    private _qt: QuatTree; //四叉树
    private _found: cc.Node[] = []; //找到的圆圈节点

    public SetPanelType() {
        this.panelType = PanelType.Fix;
    }

    onLoad() {
        this._maxWidth = 1960;
        this._maxHeight = 1080;
        let boundary: Rectangle = new Rectangle(0, 0, this._maxWidth / 2, this._maxHeight / 2);
        this._qt = new QuatTree(boundary, 4);
        this.CloseButton.node.on("click", this.OnCloseButtonClick, this);
    }

    public Display(Params: any[]): void {
        super.Display(Params);
        this.RandomGenCircle();
        this.CreateRect();
        this.FoundCount.string = `检测圆圈数量：${0}`;
    }

    private OnCloseButtonClick() {
        super.Destroy();
    }

    /**创建随机圆圈 */
    private RandomGenCircle() {
        this._circleNodes = [];
        for (let i = 0; i < this.CircleCount; i++) {
            this._circleNodes[i] = new cc.Node();
            this._circleNodes[i].parent = this.Parent;
            this._circleNodes[i].name = i.toString();

            let ctx: cc.Graphics = this._circleNodes[i].addComponent(cc.Graphics);
            let randomR = Math.floor(Math.random() * 10) + 8;
            this._circleNodes[i].setContentSize(randomR * 2, randomR * 2);
            let pos = this.GetRandomPos(randomR);
            ctx.strokeColor = cc.Color.GREEN;
            ctx.lineWidth = 5;
            this._circleNodes[i].setPosition(pos[0], pos[1]);
            ctx.circle(0, 0, randomR);
            ctx.stroke();
            this._qt.Insert(this._circleNodes[i]);
        }
    }

    /**根据半径计算可随机位置 */
    private GetRandomPos(r: number) {
        let x = this._maxWidth / 2 - r;
        let y = this._maxHeight / 2 - r;
        let randomX = Math.random() * x * 2 - x;
        let randomY = Math.random() * y * 2 - y;
        return [randomX, randomY];
    }

    /**创建可移动矩形块 */
    private CreateRect() {
        let edge = 120;
        this._moveNode = new cc.Node();
        this._moveNode.setContentSize(edge, edge);
        this._moveNode.setPosition(0, 0);
        this._moveNode.on(cc.Node.EventType.TOUCH_START, this.TouchStart, this);
        this._moveNode.on(cc.Node.EventType.TOUCH_MOVE, this.TouchMove, this);
        this._moveNode.on(cc.Node.EventType.TOUCH_END, this.TouchEnd, this);
        this._moveNode.on(cc.Node.EventType.TOUCH_CANCEL, this.TouchEnd, this);
        this._moveNode.parent = this.Parent;
        let ctx: cc.Graphics = this._moveNode.addComponent(cc.Graphics);
        ctx.strokeColor = cc.Color.YELLOW;
        ctx.lineWidth = 5;
        ctx.rect(-edge / 2, -edge / 2, edge, edge);
        ctx.stroke();
    }

    /**碰撞检测 */
    private QueryCollision() {
        this._found = [];
        let rect: Rectangle = new Rectangle(this._moveNode.x, this._moveNode.y, this._moveNode.width / 2, this._moveNode.height / 2);
        this._qt.Query(rect, this._found);
        for (let i = 0; i < this._found.length; i++) {
            const circleNode = this._found[i];
            let ctx: cc.Graphics = circleNode.getComponent(cc.Graphics);
            ctx.strokeColor = cc.Color.RED;
            ctx.stroke();
        }
        this.FoundCount.string = `检测圆圈数量：${this._found.length}`;
    }

    private TouchStart() {
        this._isStartMove = true;
    }

    private TouchMove(event: cc.Event.EventTouch) {
        if (this._isStartMove) {
            let moveDistance: cc.Vec2 = event.getDelta();
            let goalPos: cc.Vec3 = this._moveNode.position.add(cc.v3(moveDistance));
            this._moveNode.setPosition(goalPos);
            for (let i = 0; i < this._found.length; i++) {
                const node = this._found[i];
                let ctx: cc.Graphics = node.getComponent(cc.Graphics);
                ctx.strokeColor = cc.Color.GREEN;
                ctx.stroke();
            }
            this.QueryCollision();
        }
    }

    private TouchEnd() {
        this._isStartMove = false;
    }
}

/**矩形类 */
class Rectangle {

    constructor(x: number = 0, y: number = 0, half_w: number = 0, half_h: number = 0) {
        this._x = x;
        this._y = y;
        this._half_w = half_w;
        this._half_h = half_h;
    }

    public _x;
    public _y;
    public _half_w;
    public _half_h;

    /**判断矩形和圆圈是否相交 */
    public CheckIsContainer(node: cc.Node): boolean {
        return !(node.x - node.width / 2 > this._x + this._half_w || node.x + node.width / 2 < this._x - this._half_w
            || node.y - node.width / 2 > this._y + this._half_h || node.y + node.width / 2 < this._y - this._half_h);
    }

    /**判断矩形和矩形是否相交 */
    public CheckIsIntersects(range: Rectangle): boolean {
        return !(range._x - range._half_w > this._x + this._half_w || range._x + range._half_w < this._x - this._half_w
            || range._y - range._half_h > this._y + this._half_h || range._y + range._half_h < this._y - this._half_h);
    }

}

/**
 * 四叉树
 * @rectNode 矩形
 * @capacity 容量
 */
class QuatTree {

    constructor(boundary?: Rectangle, capacity?: number) {
        this._boundary = boundary;
        this._capacity = capacity;
    }

    public _boundary: Rectangle;
    public _capacity: number;
    public _circles: cc.Node[] = [];
    public _divided: boolean; //是否切割过矩形
    public _northeast: QuatTree;
    public _northwest: QuatTree;
    public _southeast: QuatTree;
    public _southwest: QuatTree;

    /**插入圆圈节点 */
    public Insert(circleNode: cc.Node) {
        if (!this._boundary.CheckIsContainer(circleNode)) {
            return;
        }
        if (this._circles.length < this._capacity) {
            this._circles.push(circleNode);
        } else {
            if (!this._divided) {
                this.Subdivide();
            }
            this._northeast.Insert(circleNode);
            this._northwest.Insert(circleNode);
            this._southeast.Insert(circleNode);
            this._southwest.Insert(circleNode);
        }
    }

    /**划分 */
    public Subdivide() {
        let x = this._boundary._x;
        let y = this._boundary._y;
        let w = this._boundary._half_w;
        let h = this._boundary._half_h;

        let ne = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
        let nw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);
        let se = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
        let sw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);

        this._northeast = new QuatTree(ne, this._capacity);
        this._northwest = new QuatTree(nw, this._capacity);
        this._southeast = new QuatTree(se, this._capacity);
        this._southwest = new QuatTree(sw, this._capacity);

        this._divided = true;
    }

    /**查询 */
    public Query(rect: Rectangle, found: cc.Node[]) {
        if (!this._boundary.CheckIsIntersects(rect)) {
            return;
        } else {
            for (let i = 0; i < this._circles.length; i++) {
                const node = this._circles[i];
                if (rect.CheckIsContainer(node)) {
                    found.push(node);
                }
            }
            if (this._divided) {
                this._northeast.Query(rect, found);
                this._northwest.Query(rect, found);
                this._southeast.Query(rect, found);
                this._southwest.Query(rect, found);
            }
        }
    }

}
