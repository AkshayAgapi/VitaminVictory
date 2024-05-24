import { _decorator, Component, Node, Button } from 'cc';
import { ScreenBase } from './Screen/BaseScreen';
import ScreenManager from '../Manager/ScreenManager';
import { GameplayScreen } from './GameplayScreen';
const { ccclass, property } = _decorator;

@ccclass('MainScreen')
export class MainScreen extends ScreenBase {

    @property(Button)
    myButton: Button | null = null;

    start() {
        this.addListeners();
    }

    update(deltaTime: number) {
        
    }

    protected setupScreen(params?: any[]): void {
        // Implement any setup logic here if needed
    }

    private addListeners() {
        if (this.myButton) {
            this.myButton.node.on(Button.EventType.CLICK, this.onButtonClick, this);
        }
    }

    private onButtonClick() {
        ScreenManager.Instance().showScreen(GameplayScreen);
    }
}
