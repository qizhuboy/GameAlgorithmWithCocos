import BaseUIPanel, { PanelType } from "./BaseUIPanel";

const { ccclass, property } = cc._decorator;

interface AStarPanelData {
    Node: cc.Node,
    Index: number,
    Row: number,
    Column: number,

    F: number, //总代价
    G: number, //当前点到起点的代价
    H: number //当前点到终点的代价
    IsObstacle: boolean, //是否是障碍物
    Parent: AStarPanelData, //父节点
}

@ccclass
export default class AStarPanel extends BaseUIPanel {

    @property(cc.Node)
    ParentNode: cc.Node = null;

    @property(cc.Button)
    CloseButton: cc.Button = null;

    @property(cc.Button)
    StartButton: cc.Button = null;

    private _datas: AStarPanelData[] = []; //所有节点数据
    private _row: number;
    private _column: number;
    private _starIndex: number;
    private _endIndex: number;
    private _limitDatas: AStarPanelData[] = []; //阻挡节点数据
    private _aStarInstance: AStar;
    public static SetTimeOutIds: number[] = [];

    public SetPanelType() {
        this.panelType = PanelType.Fix;
    }

    protected start(): void {
        this._datas = [];
        this._limitDatas = [];
        this._row = 720 / 40;
        this._column = 1200 / 40;
        this.ParentNode.children.forEach((obj, idx) => {
            obj.name = idx.toString();
            let data: AStarPanelData = <AStarPanelData>{};
            data.Node = obj;
            data.Index = idx;
            data.Row = Math.floor(idx / this._column);
            data.Column = idx % this._column;
            if (obj.color.r == 255) {
                data.IsObstacle = true;
                this._limitDatas.push(data);
            } else if (obj.color.g == 255) {
                data.IsObstacle = false;
            }
            this._datas.push(data);
        })

        this.CloseButton.node.on("click", this.OnCloseButtonClick, this);
        this.StartButton.node.on("click", this.OnStartButtonClick, this);
    }

    private OnStartButtonClick() {
        if (AStarPanel.SetTimeOutIds.length > 0) {
            AStarPanel.SetTimeOutIds.forEach(id => {
                clearTimeout(id);
            })
            AStarPanel.SetTimeOutIds = [];
        }
        this._datas.forEach(obj => {
            if (obj.Node.color.b == 255) {
                obj.Node.color = cc.Color.GREEN;
            }
        })
        this._starIndex = this.GetRandomIndex();
        this._endIndex = this.GetRandomIndex();
        this._datas[this._starIndex].Node.color = cc.Color.BLUE;
        this._datas[this._endIndex].Node.color = cc.Color.BLUE;

        if (!this._aStarInstance) {
            this._aStarInstance = new AStar(this._datas, this._limitDatas, this._row, this._column);
        }
        this._aStarInstance.SetStartAndEnd(this._starIndex, this._endIndex);
    }

    private GetRandomIndex() {
        let randomIndex = Math.floor(Math.random() * this.ParentNode.children.length);
        let isLimit = this._limitDatas.findIndex((obj) => { return obj.Index == randomIndex }) > -1;
        if (randomIndex == this._starIndex || isLimit) {
            randomIndex = this.GetRandomIndex();
        }
        return randomIndex;
    }

    private OnCloseButtonClick() {
        super.Destroy();
    }

}

class AStar {

    private _datas: AStarPanelData[]; //所有节点数据
    private _limitDatas: AStarPanelData[]; //阻挡节点数据
    private _row: number;
    private _column: number;
    private _starIndex: number;
    private _endIndex: number;
    private _openList: AStarPanelData[]; //待计算代价的节点数组
    private _closeList: AStarPanelData[]; //已选择节点数组

    constructor(datas: AStarPanelData[], limitDatas: AStarPanelData[], row: number, column: number) {
        this._datas = datas;
        this._limitDatas = limitDatas;
        this._row = row;
        this._column = column;
    }

    public SetStartAndEnd(starIndex: number, endIndex: number) {
        this._starIndex = starIndex;
        this._endIndex = endIndex;

        this._datas.forEach(obj => {
            this.InitNodeData(obj);
        })
        this._limitDatas.forEach(obj => {
            this.InitNodeData(obj);
        })
        this._openList = [];
        this._closeList = [];

        // 计算起点F值并放入_openList
        this._openList.push(this._datas[this._starIndex]);
        this.CalcNodeData(this._datas[this._starIndex]);
        this.FindMinFNodeData();
        this.ReverseNodeDatas();
    }

    private FindMinFNodeData() {
        while (this._openList.length > 0) {
            // 找到_openList中F值最小的
            let minF = this._openList[0].F;
            let curMinFNode = this._openList[0];
            this._openList.forEach(obj => {
                if (obj.F <= minF) {
                    minF = obj.F;
                    curMinFNode = obj;
                }
            });
            // 找到curMinFNode附近符合条件的节点并放入roundNodes
            let roundNodeDatas: AStarPanelData[] = [];
            let indexs: number[] = [curMinFNode.Index - this._column, curMinFNode.Index + this._column, curMinFNode.Index - 1, curMinFNode.Index + 1];
            let closeMap: { [key: number]: AStarPanelData } = <{ [key: number]: AStarPanelData }>{};
            this._closeList.forEach(obj => {
                closeMap[obj.Index] = obj;
            })
            for (let i = 0; i < indexs.length; i++) {
                switch (i) {
                    case 0: //上
                        if (indexs[i] < 0) {
                            continue;
                        }
                        break;
                    case 1: //下
                        if (indexs[i] >= this._row * this._column) {
                            continue;
                        }
                        break;
                    case 2: //左
                        if (indexs[i] % this._column == this._column - 1) {
                            continue;
                        }
                        break;
                    case 3: //右
                        if (indexs[i] % this._column == 0) {
                            continue;
                        }
                        break;
                    default:
                        break;
                }
                if (!this._datas[indexs[i]].IsObstacle && !closeMap[indexs[i]]) {
                    roundNodeDatas.push(this._datas[indexs[i]]);
                }
            }

            roundNodeDatas.forEach(data => {
                let index = this._openList.findIndex(obj => {
                    return obj.Index == data.Index;
                })
                let dis = this.CalcTwoNodeDistance(curMinFNode, data);
                if (index == -1) { //未放入_openList的
                    data.Parent = curMinFNode;
                    data.G = curMinFNode.G + dis;
                    data.H = this.CalcH(data);
                    data.F = data.G + data.H;
                    this._openList.push(data);
                } else {
                    data.H = this.CalcH(data);
                    let F_alternative: number = curMinFNode.G + dis + data.H; //假设父节点换成当前节点的总代价F
                    if (F_alternative < data.F) {
                        data.Parent = curMinFNode;
                        data.G = curMinFNode.G + dis;
                        data.F = data.G + data.H;
                    }
                }
            })

            let findIndex = this._openList.findIndex(obj => {
                return obj.Index == curMinFNode.Index;
            })
            if (findIndex > -1) {
                this._closeList.push(this._openList[findIndex]);
                this._openList.splice(findIndex, 1);
            }

            let endData = roundNodeDatas.find(obj => {
                return obj.Index == this._endIndex;
            })
            if (endData) {
                break;
            }
        }
    }

    private ReverseNodeDatas() {
        let datas: AStarPanelData[] = [this._datas[this._endIndex]];
        while (datas[datas.length - 1].Parent && datas.length > 0) {
            datas.push(datas[datas.length - 1].Parent);
        }
        datas.reverse();
        let time = 0;
        datas.forEach(obj => {
            let id = setTimeout(() => {
                obj.Node.color = cc.Color.BLUE;
            }, time)
            time += 150;
            AStarPanel.SetTimeOutIds.push(id);
        })
    }

    private CalcNodeData(targetNodeData: AStarPanelData) {
        targetNodeData.G = this.CalcG(targetNodeData);
        targetNodeData.H = this.CalcH(targetNodeData);
        targetNodeData.F = targetNodeData.G + targetNodeData.H;
    }

    private InitNodeData(data: AStarPanelData) {
        data.F = 0;
        data.G = 0;
        data.H = 0;
        data.Parent = null;
    }

    /**计算起点到当前点的代价 */
    private CalcG(data: AStarPanelData) {
        let g = this.CalcTwoNodeDistance(data, this._datas[this._starIndex]);
        return g;
    }

    /**计算终点到当前点的代价 */
    private CalcH(data: AStarPanelData) {
        let h = this.CalcTwoNodeDistance(data, this._datas[this._endIndex]);
        return h;
    }

    /**计算两点之间的代价 */
    private CalcTwoNodeDistance(startNode: AStarPanelData, endNode: AStarPanelData) {
        let distance = Math.abs(startNode.Row - endNode.Row) + Math.abs(startNode.Column - endNode.Column);
        return distance;
    }

}

