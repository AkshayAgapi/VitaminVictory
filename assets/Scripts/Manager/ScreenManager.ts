import { _decorator, Component } from 'cc';
import { GenericSingleton } from "../Common/GenericSingleton";
import { ScreenBase } from '../UI/Screen/BaseScreen';
import { MainScreen } from '../UI/MainScreen';

const { ccclass, property } = _decorator;

@ccclass('ScreenManager')
export default class ScreenManager extends GenericSingleton<ScreenManager> {

    @property([ScreenBase])
    screenPrefabs: ScreenBase[] = [];

    private _screens: Map<string, ScreenBase> = new Map();

    protected onLoad() {
        super.onLoad();
        this.registerAllScreens();
        this.showScreen(MainScreen);
    }

    private registerAllScreens() {
        this.screenPrefabs.forEach(prefab => {
            this._screens.set(prefab.name, prefab);
            prefab.node.active = false;
        });
    }

    public showScreen<T extends ScreenBase>(ctor: { new(): T }, params?: any[]): void {
        const screen = this.getScreenByConstructor(ctor);
        if (screen) {
            this._screens.forEach(s => {
                if (s !== screen) {
                    s.onHide();
                }
            });
            screen.onShow(params);
        } else {
            console.warn(`ScreenManager: Screen not found.`);
        }
    }

    public hideScreen<T extends ScreenBase>(ctor: { new(): T }): void {
        const screen = this.getScreenByConstructor(ctor);
        if (screen) {
            screen.onHide();
        } else {
            console.warn(`ScreenManager: Screen not found.`);
        }
    }

    private getScreenByConstructor<T extends ScreenBase>(ctor: { new(): T }): ScreenBase | undefined {
        for (let [key, screen] of this._screens) {
            if (screen instanceof ctor) {
                return screen;
            }
        }
        return undefined;
    }
}
