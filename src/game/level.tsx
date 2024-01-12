import { RandomBlockGenerator } from "./blockchain";
import { BlockId } from "./blocks";

type Level = {
    triggerFunction: (blm:BlockLevelManager, rbg:RandomBlockGenerator) => void;
    nextLevelPointRequirement: number;
}

const level0 = {
    triggerFunction: level0Function,
    nextLevelPointRequirement: 100
}

const level1 = {
    triggerFunction: level1Function,
    nextLevelPointRequirement: 1000
}

export type AddPointReturn = {
    level: number;
    finishGame: boolean;
}

export class BlockLevelManager{
    level: number;
    points: number;
    levels: Level[];

    pointsToCoin: number;
    toNextCoin: number;
    coins: number;
    constructor(){
        this.level = 0;
        this.levels = [level0];
        this.points = 90;

        this.pointsToCoin = 20; // to adjust
        this.toNextCoin = 0;
        this.coins = 0;

    }
    initLevel0(rbg:RandomBlockGenerator){
        this.levels = [level0, level1];
        this.levels[0].triggerFunction(this, rbg);
    }
    addPointCoins(p:number):number{
        this.toNextCoin += p;
        const nCoins = Math.floor(this.toNextCoin/this.pointsToCoin);
        this.toNextCoin -= nCoins * this.pointsToCoin;
        this.coins += nCoins;
        return nCoins;
    }
    checkNextLevel():boolean{
        if(this.level < this.levels.length){
            const level = this.levels[this.level];
            return this.points > level.nextLevelPointRequirement;
        }
        return false;
    }
    //returns if level up
    addPoints(p:number, rbg:RandomBlockGenerator):AddPointReturn{
        this.points += p;
        this.addPointCoins(p);
        if(this.checkNextLevel()){
            this.level++;
            if(this.level < this.levels.length)
            this.levels[this.level].triggerFunction(this, rbg);
        }
        return {level: this.level, finishGame: this.level >= this.levels.length};
    }
}

export function level0Function(blm:BlockLevelManager, rbg:RandomBlockGenerator){
    console.log('loading level 0');
    blm.coins += 10;
    rbg.addShapeProbability(0, 0.5);
    rbg.addShapeProbability(1, 0.5);
    rbg.addBlockProbability(BlockId.StoneBlock, 0.5);
    rbg.addBlockProbability(BlockId.WoodBlock, 0.5);
}

export function level1Function(blm:BlockLevelManager, rbg:RandomBlockGenerator){
    console.log('loading level 1');
    blm.coins += 10;
    rbg.addShapeProbability(1, 0.2, 0);
    rbg.addShapeProbability(2, 0.3, 1);

    rbg.addBlockProbability(BlockId.SandBlock, 0.1, BlockId.StoneBlock);
    rbg.addBlockProbability(BlockId.SandBlock, 0.1, BlockId.WoodBlock);
}