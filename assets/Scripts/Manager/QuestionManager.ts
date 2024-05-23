import { GenericSingleton } from "../Common/GenericSingleton";
import { _decorator, Component, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FoodItemData')
export class FoodItemData {
    @property(SpriteFrame)
    foodSprite: SpriteFrame = null;

    @property
    id: string = '';
}

@ccclass('VitaminQuestion')
export class VitaminQuestion {
    @property
    vitamin: string = '';

    @property([FoodItemData])
    foodItems: FoodItemData[] = [];
}

@ccclass('QuestionManager')
export class QuestionManager extends GenericSingleton<QuestionManager> {
    
    @property([VitaminQuestion])
    vitaminQuestions: VitaminQuestion[] = [];

    public currentQuestionIndex: number = 0;

    getNextQuestion(): VitaminQuestion | null {
        if (this.currentQuestionIndex < this.vitaminQuestions.length) {
            // Get the current question
            const currentQuestion = this.vitaminQuestions[this.currentQuestionIndex];
            
            // Increment the index for the next call
            this.currentQuestionIndex++;

            return currentQuestion;
        } else {
            console.error("No more questions to display.");
            return null;  // or you could reset the index if you want to loop
        }
    }

    getRandomUniqueFoodItems(excludeQuestionIndex: number, excludeIds: Set<string>, count: number): FoodItemData[] {
        const allFoodItems: FoodItemData[] = [];

        // Collect all food items except those from the excluded question and those with excluded IDs
        this.vitaminQuestions.forEach((question, index) => {
            if (index !== excludeQuestionIndex) {
                question.foodItems.forEach(item => {
                    if (!excludeIds.has(item.id)) {
                        allFoodItems.push(item);
                        excludeIds.add(item.id); // Add the ID to the set to ensure uniqueness
                    }
                });
            }
        });

        // Shuffle and return the required count of items
        this.shuffleArray(allFoodItems);
        return allFoodItems.slice(0, count);
    }

    // Utility method to shuffle an array
    shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
