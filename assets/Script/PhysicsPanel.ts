const { ccclass, property } = cc._decorator;

@ccclass
export default class PhysicsPanel extends cc.Component {

    @property(cc.Node)
    Node1: cc.Node = null;

    @property(cc.Node)
    Node2: cc.Node = null;

    @property(cc.Button)
    CloseButton: cc.Button = null;

    onLoad() {
        this.CloseButton.node.on("click", this.OnCloseButtonClick, this);
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0, -640);
    }

    private OnCloseButtonClick() {
        this.node.destroy();
    }

}

