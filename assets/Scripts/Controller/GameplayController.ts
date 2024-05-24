import { _decorator, Component, Prefab, Node, instantiate, Tween, UIOpacity, Vec3 } from 'cc';
import { QuestionManager, VitaminQuestion } from '../Manager/QuestionManager';
import { FoodItem } from '../FoodItem/FoodItem';
import { DragDrop } from '../DragDrop';
import eventTarget, { Events } from '../Common/EventManager';

const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property(Prefab)
    foodItemPrefab: Prefab | null = null;

    @property(Node)
    dragArea: Node | null = null;

    @property(DragDrop)
    dragDrop: DragDrop | null = null;

    private questionManager: QuestionManager | null = null;

    onEnable() {
        this.questionManager = QuestionManager.Instance();
        this.loadNextQuestion();
        eventTarget.on(Events.ALL_ITEMS_CORRECT, this.loadNextQuestion, this);
    }

    onDestroy() {
        eventTarget.off(Events.ALL_ITEMS_CORRECT, this.loadNextQuestion, this);
    }

    loadNextQuestion() {
        if (this.questionManager) {
            const nextQuestion: VitaminQuestion | null = this.questionManager.getNextQuestion();
            if (nextQuestion) {
                this.displayQuestion(nextQuestion);
            }
        }
    }

    displayQuestion(question: VitaminQuestion) {
        if (!this.foodItemPrefab || !this.dragArea || !this.dragDrop) {
            console.error('Prefab, Drag Area, or DragDrop not assigned.');
            return;
        }

        // Clear previous items
        this.dragArea.removeAllChildren();

        // Collect IDs of the correct food items
        const correctItemIds = new Set(question.foodItems.map(item => item.id));

        // Get random unique food items excluding the correct items
        const randomFoodItems = this.questionManager!.getRandomUniqueFoodItems(this.questionManager!.currentQuestionIndex - 1, correctItemIds, 12 - question.foodItems.length);

        // Combine correct and random food items
        const combinedFoodItems = question.foodItems.concat(randomFoodItems);

        // Shuffle combined items
        this.questionManager!.shuffleArray(combinedFoodItems);

        let instantiatedCount = 0;

        // Instantiate and display food items one by one with a fade-in effect
        combinedFoodItems.forEach((foodItemData, index) => {
            this.scheduleOnce(() => {
                const foodItemNode = instantiate(this.foodItemPrefab);
                const foodItem = foodItemNode.getComponent(FoodItem);
                if (foodItem) {
                    foodItem.setData(foodItemData.foodSprite, foodItemData.id, foodItemData.id);
                    this.dragArea.addChild(foodItemNode);

                    // Set initial opacity to 0 and scale to 0
                    const opacity = foodItemNode.addComponent(UIOpacity);
                    opacity.opacity = 0;
                    foodItemNode.setScale(new Vec3(0, 0, 0));

                    // Fade-in and scale-in tween animation
                    new Tween(opacity)
                        .to(0.5, { opacity: 255 }, { easing: 'quadInOut' })
                        .start();

                    new Tween(foodItemNode)
                        .to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                        .start();

                    instantiatedCount++;
                    if (instantiatedCount === combinedFoodItems.length) {
                        // Set only the correct item IDs in DragDrop and initialize
                        this.dragDrop.setCorrectItemIds(new Set(question.foodItems.map(item => item.id)));
                        this.dragDrop.Init(question.vitamin, question.foodItems.length);
                    }
                }
            }, index * 0.05); // Delay each instantiation by 0.05 seconds
        });
    }
}
