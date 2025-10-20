import BaseUIPanel, { PanelType } from "./BaseUIPanel";

export default class UIManager {

    private static _instance: UIManager = null;
    private showPanels: BaseUIPanel[] = [];
    private fixNode: cc.Node;
    private popUpNode: cc.Node;

    public static get Instance(): UIManager {
        if (!this._instance) {
            this._instance = new UIManager();
        }
        return this._instance;
    }

    public async ShowUIPanel(panelName: string, ...Params: any[]) {
        let prefab = await this.LoadPanel<cc.Prefab>(panelName, cc.Prefab);
        let node = cc.instantiate(prefab);
        let baseIUPanel = node.getComponent(BaseUIPanel);
        baseIUPanel.SetPanelType();
        this.SetParentNode(baseIUPanel);
        baseIUPanel.Display(Params);
        this.showPanels.push(baseIUPanel);
    }

    private SetParentNode(baseUIPanel: BaseUIPanel) {
        switch (baseUIPanel.PanelType) {
            case PanelType.Fix:
                if (!this.fixNode) {
                    this.fixNode = cc.find("Canvas/FixNode");
                }
                baseUIPanel.node.parent = this.fixNode;
                break;
            case PanelType.PopUp:
                if (!this.popUpNode) {
                    this.popUpNode = cc.find("Canvas/PopUpNode");
                }
                baseUIPanel.node.parent = this.popUpNode;
                break;
            default:
                break;
        }
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

    public DestroyPanel(baseUIPanel: BaseUIPanel) {
        for (let i = this.showPanels.length - 1; i >= 0; i--) {
            const basePanel = this.showPanels[i];
            if (baseUIPanel == basePanel) {
                this.showPanels.splice(i, 1);
                break;
            }
        }
        baseUIPanel.node.destroy();
    }
}