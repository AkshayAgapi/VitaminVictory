import { _decorator, Component, Prefab, Node, instantiate } from 'cc';
import { QuestionManager, VitaminQuestion } from '../Manager/QuestionManager';
import { FoodItem } from '../FoodItem/FoodItem';
import { DragDrop } from '../DragDrop';

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

    onLoad() {
        this.questionManager = QuestionManager.Instance();
        this.loadNextQuestion();
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

        // Instantiate and display food items
        combinedFoodItems.forEach(foodItemData => {
            const foodItemNode = instantiate(this.foodItemPrefab);
            const foodItem = foodItemNode.getComponent(FoodItem);
            if (foodItem) {
                foodItem.setData(foodItemData.foodSprite, foodItemData.id, foodItemData.id);
                this.dragArea.addChild(foodItemNode);
            }
        });

        // Set only the correct item IDs in DragDrop
        this.dragDrop.setCorrectItemIds(new Set(question.foodItems.map(item => item.id)));
        this.dragDrop.Init();
    }
}
