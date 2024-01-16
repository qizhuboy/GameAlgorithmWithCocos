const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Button)
    QuadTreeButton: cc.Button = null;

    @property(cc.Button)
    AStarButton: cc.Button = null;

    @property(cc.Node)
    PanelNode: cc.Node = null;

    protected onLoad(): void {
        this.QuadTreeButton.node.on("click", this.OnQuadTreeButtonClick, this);
        this.AStarButton.node.on("click", this.OnAStarButtonClick, this);
    }

    private async OnQuadTreeButtonClick() {
        let quadTreePrefab = await this.LoadPanel<cc.Prefab>("QuadTreePanel", cc.Prefab);
        let node = cc.instantiate(quadTreePrefab);
        node.parent = this.PanelNode;
    }

    private async OnAStarButtonClick() {
        let aStarPrefab = await this.LoadPanel<cc.Prefab>("AStarPanel", cc.Prefab);
        let node = cc.instantiate(aStarPrefab);
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

