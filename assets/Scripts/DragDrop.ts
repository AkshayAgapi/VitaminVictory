import { _decorator, Component, Node, UITransform, EventTouch, Vec3, Vec2, Prefab, instantiate, director, Canvas } from 'cc';
import { FoodItem } from './FoodItem/FoodItem';
import { DropMessageView, MessageType } from './UI/DropMessageView';
const { ccclass, property } = _decorator;

@ccclass('DragDrop')
export class DragDrop extends Component {

    @property(Node)
    dragArea: Node | null = null;

    @property(Node)
    dropArea: Node | null = null;

    @property(Prefab)
    dragItemPlaceHolder: Prefab | null = null;

    //Change this to 
    @property([DropMessageView])
    dropMessageView: DropMessageView | null = null;

    private selectedNode: Node | null = null;
    private initialPos: Vec3 = new Vec3();
    private initialParent: Node | null = null;
    private originalSiblingIndex: number = 0;
    private placeholderNode: Node | null = null;
    private touchOffset: Vec3 = new Vec3();

    // List of correct item IDs
    private correctItemIds: Set<string> = new Set();

    Init() {
        this.addDragListeners(this.dragArea);
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
            console.log("Pa pa");
            if (foodItem && this.correctItemIds.has(foodItem.id)) {
                console.log("Da da");

                // Allow dropping if the item is correct
                this.dropArea!.addChild(this.selectedNode);
                //this.selectedNode.setPosition(dropAreaUITransform.convertToNodeSpaceAR(new Vec3(nodePos2D.x, nodePos2D.y, 0)));
                this.removeDragListeners(this.selectedNode);
            } else {
                console.log("Ma ma ");

                // Reset position and log message if the item is incorrect
                this.selectedNode.setPosition(this.initialPos);
                this.dropMessageView.showMessage("This is a positive message!", MessageType.Positive);
                if (this.initialParent) {
                    this.initialParent.insertChild(this.selectedNode, this.originalSiblingIndex);
                }
            }
        } else {
            console.log("Co CO");

            // Reset position if dropped outside of both areas or attempt to drag back to dragArea
            this.selectedNode.setPosition(this.initialPos);
            if (this.initialParent) {
                this.initialParent.insertChild(this.selectedNode, this.originalSiblingIndex);
            }
        }

        // Reset the z-index
        //this.selectedNode.setSiblingIndex(this.originalSiblingIndex);

        // Destroy the placeholder
        if (this.placeholderNode) {
            this.placeholderNode.destroy();
            this.placeholderNode = null;
        }

        // Restore the selected node to its initial parent
        // if (this.initialParent) {
        //     this.initialParent.insertChild(this.selectedNode, this.originalSiblingIndex);
        //     this.selectedNode.setPosition(this.initialPos);
        // }

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
}
