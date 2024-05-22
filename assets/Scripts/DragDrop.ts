// DragDrop.ts
import { _decorator, Component, Node, UITransform, EventTouch, Vec3, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DragDrop')
export class DragDrop extends Component {

    @property(Node)
    dragArea: Node | null = null;

    @property(Node)
    dropArea: Node | null = null;

    private selectedNode: Node | null = null;
    private initialPos: Vec3 = new Vec3();
    private initialParent: Node | null = null;
    private originalSiblingIndex: number = 0;

    onLoad() {
        this.addDragListeners(this.dragArea);
        this.addDragListeners(this.dropArea);
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
        this.initialParent = node.parent.parent;
        this.originalSiblingIndex = node.getSiblingIndex();
        
        // Set a high z-index to ensure the dragged item appears on top
        node.setSiblingIndex(9999);
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

        if (dropAreaBoundingBox.contains(nodePos2D)) {
            this.dropArea!.addChild(this.selectedNode);
            this.selectedNode.setPosition(dropAreaUITransform.convertToNodeSpaceAR(new Vec3(nodePos2D.x, nodePos2D.y, 0)));
        } else if (dragAreaBoundingBox.contains(nodePos2D)) {
            this.dragArea!.addChild(this.selectedNode);
            this.selectedNode.setPosition(dragAreaUITransform.convertToNodeSpaceAR(new Vec3(nodePos2D.x, nodePos2D.y, 0)));
        } else {
            this.selectedNode.setPosition(this.initialPos);
            this.selectedNode.parent = this.initialParent;
        }

        // Reset the z-index
        this.selectedNode.setSiblingIndex(this.originalSiblingIndex);

        this.selectedNode = null;
    }
}
