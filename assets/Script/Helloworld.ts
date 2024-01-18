const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Button)
    QuadTreeButton: cc.Button = null;

    @property(cc.Button)
    AStarButton: cc.Button = null;

    @property(cc.Button)
    ScratchCardButton: cc.Button = null;

    @property(cc.Node)
    PanelNode: cc.Node = null;

    protected onLoad(): void {
        this.QuadTreeButton.node.on("click", this.OnQuadTreeButtonClick, this);
        this.AStarButton.node.on("click", this.OnAStarButtonClick, this);
        this.ScratchCardButton.node.on("click", this.OnScratchCardButtonClick, this);
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

