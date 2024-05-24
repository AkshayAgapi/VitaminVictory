import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScreenBase')
export abstract class ScreenBase extends Component {

    public onShow(params?: any[]): void {
        this.node.active = true;
        this.setupScreen(params);
    }

    protected abstract setupScreen(params?: any[]): void;

    public onHide(): void {
        this.node.active = false; 
    }
}
