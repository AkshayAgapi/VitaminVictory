import { _decorator, Component, Node, Label, Sprite, Tween, Vec3, UIOpacity, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

enum MessageType {
    Positive,
    Negative
}

@ccclass('DropMessageView')
export class DropMessageView extends Component {
    @property(Node)
    background: Node | null = null;

    @property(Label)
    messageLabel: Label | null = null;

    @property(Sprite)
    icon: Sprite | null = null;

    @property(Node)
    viewNode: Node | null = null;

    @property(SpriteFrame)
    positiveSprite: SpriteFrame | null = null;

    @property(SpriteFrame)
    negativeSprite: SpriteFrame | null = null;

    public static MessageType = MessageType;

    onLoad() {
        this.resetView();
    }

    public showMessage(text: string, type: MessageType) {
        if (this.viewNode) {
            this.viewNode.active = true;
        }

        this.resetView();

        if (this.messageLabel) {
            this.messageLabel.string = text;
        }

        if (this.background) {
            const bgOpacity = this.background.getComponent(UIOpacity);
            if (bgOpacity) {
                new Tween(bgOpacity)
                    .to(0.5, { opacity: 255 }, { easing: 'quadInOut' })
                    .start();
            }
        }

        if (this.icon) {
            if (type === MessageType.Positive) {
                this.icon.spriteFrame = this.positiveSprite;
            } else if (type === MessageType.Negative) {
                this.icon.spriteFrame = this.negativeSprite;
            }

            new Tween(this.icon.node)
                .to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                .start();
        }

        if (this.messageLabel) {
            new Tween(this.messageLabel.node)
                .to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                .start();
        }

        // Schedule to deactivate viewNode after 2 seconds
        this.scheduleOnce(() => {
            if (this.viewNode) {
                this.viewNode.active = false;
            }
        }, 2);
    }

    private resetView() {
        if (this.background) {
            const bgOpacity = this.background.getComponent(UIOpacity);
            if (bgOpacity) {
                bgOpacity.opacity = 0;
            }
        }
        if (this.messageLabel) {
            this.messageLabel.node.setScale(new Vec3(0, 0, 0));
        }
        if (this.icon) {
            this.icon.node.setScale(new Vec3(0, 0, 0));
        }
    }
}

export { MessageType };
