import { RandomBlockGenerator } from "./blockchain";
import { BlockId } from "./blocks";
import { BlockComboEngine } from "./combo";
import { BlockCombos } from "./customCombos";
import { ComboChooseInterface } from "./interface";

type Level = {
    triggerFunction: (blm:BlockLevelManager, 
        rbg:RandomBlockGenerator, cci: ComboChooseInterface, comboEngine?:BlockComboEngine) => void;
    nextLevelPointRequirement: number;
}

const level0 = {
    triggerFunction: level0Function,
    nextLevelPointRequirement: 100
}

const level1 = {
    triggerFunction: level1Function,
    nextLevelPointRequirement: 110
}

const level2 = {
    triggerFunction: level2Function,
    nextLevelPointRequirement: 800
}

export type AddPointReturn = {
    level: number;
    levelUp: boolean;
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
    initLevel0(rbg:RandomBlockGenerator, cci: ComboChooseInterface, comboEngine?:BlockComboEngine){
        this.levels = [level0, level1, level2];
        this.levels[0].triggerFunction(this, rbg, cci);
        //cci.active = true;
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
    addPoints(p:number, rbg:RandomBlockGenerator, 
        cci:ComboChooseInterface, ce: BlockComboEngine):AddPointReturn{
        this.points += p;
        this.addPointCoins(p);
        let levelUp = false;
        if(this.checkNextLevel()){
            levelUp = true;
            this.level++;
            if(this.level < this.levels.length)
            this.levels[this.level].triggerFunction(this, rbg, cci);
        }
        return {level: this.level, finishGame: this.level >= this.levels.length,
            levelUp: levelUp
        };
    }
}

export function level0Function(blm:BlockLevelManager, rbg:RandomBlockGenerator, cci: ComboChooseInterface){
    console.log('loading level 0');
    blm.coins += 10;
    rbg.addShapeProbability(0, 0.5);
    rbg.addShapeProbability(1, 0.5);
    rbg.addBlockProbability(BlockId.StoneBlock, 0.5);
    rbg.addBlockProbability(BlockId.WoodBlock, 0.5);
    for(let i = 0; i < 6; ++i){
        const combo = BlockCombos.generateCombo(rbg.blockProbabilities, 4);
        cci.items[i].setCombo(combo);
    }
}

export function level1Function(blm:BlockLevelManager, 
    rbg:RandomBlockGenerator, cci: ComboChooseInterface){
    console.log('loading level 1');
    blm.coins += 10;
    rbg.addShapeProbability(1, 0.2, 0);
    rbg.addShapeProbability(2, 0.3, 1);

    rbg.addBlockProbability(BlockId.SandBlock, 0.1, BlockId.StoneBlock);
    rbg.addBlockProbability(BlockId.SandBlock, 0.1, BlockId.WoodBlock);
    cci.changeNeedSelected(1);
    for(let i = 0; i < 6; ++i){
        const combo = BlockCombos.generateCombo(rbg.blockProbabilities, 3);
        cci.items[i].setCombo(combo);
    }
    //cci.active = true; add button on combo block interface
}

export function level2Function(blm:BlockLevelManager, 
    rbg:RandomBlockGenerator, cci: ComboChooseInterface, comboEngine?:BlockComboEngine){
    console.log('loading level 2');
    blm.coins += 10;
    rbg.addShapeProbability(1, 0.1, 0);
    rbg.addShapeProbability(2, 0.1, 1);
    rbg.addShapeProbability(3, 0.1, 0);

    rbg.addBlockProbability(BlockId.SandBlock, 0.1, BlockId.StoneBlock);
    rbg.addBlockProbability(BlockId.SandBlock, 0.1, BlockId.WoodBlock);
    if(cci.needSelected !== 0){
        // add new combo if not selected previous
        //const combo = BlockCombos.generateCombo(rbg.blockProbabilities, 3);
        //comboEngine?.addRandomCombos(combo);
        //cci.
    }


    cci.changeNeedSelected(1);
    for(let i = 0; i < 6; ++i){
        const combo = BlockCombos.generateCombo(rbg.blockProbabilities, 4);
        cci.items[i].setCombo(combo);
    }
    //cci.active = true;
}