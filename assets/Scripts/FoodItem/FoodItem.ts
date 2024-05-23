import { _decorator, Component, Sprite, Label, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FoodItem')
export class FoodItem extends Component {

    @property(Sprite)
    foodSprite: Sprite | null = null;

    @property(Label)
    foodLabel: Label | null = null;

    id: string = '';

    setData(spriteFrame: SpriteFrame, label: string, id: string): void {
        if (this.foodSprite) {
            this.foodSprite.spriteFrame = spriteFrame;
        }
        if (this.foodLabel) {
            this.foodLabel.string = label;
        }
        this.id = id;
    }

    getId(): string {
        return this.id;
    }
}
