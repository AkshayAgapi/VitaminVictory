import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GenericSingleton')
export abstract class GenericSingleton<T> extends Component {

    @property
    private destroyOnLoad = true;

    private static _instances: Map<string, Component> = new Map();

    public static Instance<T extends Component>(this: new () => T): T {
        const className = this.name;

        if (!GenericSingleton._instances.has(className)) {
            const newNode = new Node(className);
            const newComponent = newNode.addComponent(this);
            GenericSingleton._instances.set(className, newComponent);
            console.log("Generic Singleton new " + className);
        }

        return GenericSingleton._instances.get(className) as T;
    }

    public static IsExist<T extends Component>(this: new () => T): boolean {
        return GenericSingleton._instances.has(this.name);
    }

    protected onLoad(): void {
        const className = this.constructor.name;

        if (GenericSingleton._instances.has(className) && this.destroyOnLoad) {
            const existingInstance = GenericSingleton._instances.get(className);
            if (existingInstance && existingInstance.node) {
                GenericSingleton._instances.delete(className);
                existingInstance.node.destroy();
            }
        }

        if (GenericSingleton._instances.has(className) && GenericSingleton._instances.get(className) !== this && !this.destroyOnLoad) {
            this.node.destroy();
            return;
        }

        GenericSingleton._instances.set(className, this);
    }
}
