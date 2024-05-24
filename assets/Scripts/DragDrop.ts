import { _decorator, Component, Node, UITransform, EventTouch, Vec3, Vec2, Prefab, instantiate, UIOpacity, Label, Tween } from 'cc';
import { FoodItem } from './FoodItem/FoodItem';
import { DropMessageView, MessageType } from './UI/DropMessageView';
import eventTarget, { Events } from './Common/EventManager';
import AudioManager, { SoundClipType } from './Manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('DragDrop')
export class DragDrop extends Component {

    @property(Node)
    dragArea: Node | null = null;

    @property(Node)
    dropArea: Node | null = null;

    @property(Prefab)
    dragItemPlaceHolder: Prefab | null = null;

    @property(DropMessageView)
    dropMessageView: DropMessageView | null = null;

    @property(Label)
    questionVitaminLabel: Label | null = null;

    private selectedNode: Node | null = null;
    private initialPos: Vec3 = new Vec3();
    private initialParent: Node | null = null;
    private originalSiblingIndex: number = 0;
    private placeholderNode: Node | null = null;
    private touchOffset: Vec3 = new Vec3();

    // List of correct item IDs
    private correctItemIds: Set<string> = new Set();
    private correctItemsMoved: number = 0;
    private totalCorrectItems: number = 0;

    Init(questionVitamin: string, totalCorrectItems: number) {
        this.correctItemsMoved = 0;
        this.totalCorrectItems = totalCorrectItems;
        this.addDragListeners(this.dragArea);
        this.setQuestion(questionVitamin);
    }

    setQuestion(questionVitamin: string) {
        if (this.questionVitaminLabel) {
            this.questionVitaminLabel.string = questionVitamin;

            // Create a tween for scaling up and then back to normal
            new Tween(this.questionVitaminLabel.node)
                .to(0.2, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: 'quadInOut' })
                .to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: 'quadInOut' })
                .start();
        }
    }

    addDragListeners(area: Node | null) {
        if (area) {
            area.children.forEach(child => {
                child.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
                child.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
                child.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
                child.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
            });
        }
    }

    onTouchStart(event: EventTouch) {
        const node = event.target as Node;
        this.selectedNode = node;
        this.initialPos.set(node.position);
        this.initialParent = node.parent;
        this.originalSiblingIndex = node.getSiblingIndex();
        
        // Calculate the touch offset
        const touchPos = event.getLocation();
        const nodeWorldPos = node.getComponent(UITransform)!.convertToWorldSpaceAR(new Vec3(0, 0, 0));
        this.touchOffset.set(nodeWorldPos.x - touchPos.x, nodeWorldPos.y - touchPos.y, 0);

        // Move the selected node to the root level (or a designated layer)
        this.node.addChild(node);
        node.setWorldPosition(nodeWorldPos);

        // Instantiate the placeholder
        if (this.dragItemPlaceHolder && this.initialParent) {
            this.placeholderNode = instantiate(this.dragItemPlaceHolder);
            this.placeholderNode.setPosition(this.initialPos);
            this.initialParent.insertChild(this.placeholderNode, this.originalSiblingIndex);
        }
    }

    onTouchMove(event: EventTouch) {
        if (!this.selectedNode) return;
        const delta = event.getDelta();
        this.selectedNode.setPosition(this.selectedNode.position.x + delta.x, this.selectedNode.position.y + delta.y);
    }

    onTouchEnd(event: EventTouch) {
        if (!this.selectedNode) return;

        const dropAreaUITransform = this.dropArea!.getComponent(UITransform)!;
        const dragAreaUITransform = this.dragArea!.getComponent(UITransform)!;
        const nodeWorldPos = this.selectedNode.worldPosition;
        const nodePos2D = new Vec2(nodeWorldPos.x, nodeWorldPos.y);

        const dropAreaBoundingBox = dropAreaUITransform.getBoundingBoxToWorld();
        const dragAreaBoundingBox = dragAreaUITransform.getBoundingBoxToWorld();

        if (this.initialParent === this.dragArea && dropAreaBoundingBox.contains(nodePos2D)) {
            const foodItem = this.selectedNode.getComponent(FoodItem);

            if (foodItem && this.correctItemIds.has(foodItem.id)) {
                // Allow dropping if the item is correct
                this.dropArea!.addChild(this.selectedNode);
                this.correctItemsMoved += 1;

                // Check if all correct items have been moved
                if (this.correctItemsMoved >= this.totalCorrectItems) {
                    AudioManager.Instance().playSfx(SoundClipType.VICTORY_SFX);
                    this.dropMessageView.showMessage("Great job!", MessageType.Positive);
                    this.scheduleOnce(() => {
                        eventTarget.emit(Events.ALL_ITEMS_CORRECT);
                        this.clearDropArea();  // Clear the drop area after showing the positive message
                    }, 2); // Delay to show the positive message
                }

                this.removeDragListeners(this.selectedNode);
            } else {
                // Reset position and log message if the item is incorrect
                this.selectedNode.setPosition(this.initialPos);
                AudioManager.Instance().playSfx(SoundClipType.FAILURE_SFX);
                this.dropMessageView.showMessage("Wrong move!", MessageType.Negative);
                if (this.initialParent) {
                    this.initialParent.insertChild(this.selectedNode, this.originalSiblingIndex);
                }
            }
        } else {
            // Reset position if dropped outside of both areas or attempt to drag back to dragArea
            this.selectedNode.setPosition(this.initialPos);
            if (this.initialParent) {
                this.initialParent.insertChild(this.selectedNode, this.originalSiblingIndex);
            }
        }

        // Reset the z-index
        this.selectedNode.setSiblingIndex(this.originalSiblingIndex);

        // Destroy the placeholder
        if (this.placeholderNode) {
            this.placeholderNode.destroy();
            this.placeholderNode = null;
        }

        this.selectedNode = null;

        // Update positions after dropping the item
        this.updateDragAreaPositions();
    }

    removeDragListeners(node: Node) {
        node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    updateDragAreaPositions() {
        if (!this.dragArea) return;
        const children = this.dragArea.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i] !== this.placeholderNode) {
                children[i].setPosition(new Vec3(0, -i * 100, 0)); // Adjust this as per your layout requirement
            }
        }
    }

    // Method to set the correct item IDs
    setCorrectItemIds(correctItemIds: Set<string>) {
        this.correctItemIds = correctItemIds;
    }

    // Method to clear the drop area
    clearDropArea() {
        if (this.dropArea) {
            this.dropArea.removeAllChildren();
        }
    }
}
