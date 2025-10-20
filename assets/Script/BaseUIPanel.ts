import UIManager from "./UIManager";

const { ccclass, property } = cc._decorator;

export enum PanelType {
    Fix,
    PopUp
}

@ccclass
export default class BaseUIPanel extends cc.Component {

    protected panelType: PanelType;

    protected onLoad(): void {
        this.node.addComponent(cc.BlockInputEvents);
    }

    public SetPanelType(): void {}

    public Display(Params: any[]): void {

    }

    public get PanelType() {
        return this.panelType;
    }

    protected Destroy(): void {
        UIManager.Instance.DestroyPanel(this);
    }

}
