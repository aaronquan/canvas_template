import { RandomBlockGenerator } from "./blockchain";
import { BlockId } from "./blocks";
import { BlockComboEngine } from "./combo";
import { BlockCombos } from "./customCombos";
import { GameGrid } from "./game";
import { AbilityItem, ComboChooseInterface } from "./interface";

type Level = {
    //triggerFunction: (blm:BlockLevelManager, 
    //    rbg:RandomBlockGenerator, cci: ComboChooseInterface, comboEngine?:BlockComboEngine) => void;
    triggerFunction: (game:GameGrid) => void;
    nextLevelPointRequirement: number;
}

const level0 = {
    triggerFunction: level0Function,
    nextLevelPointRequirement: 75
}

const level1 = {
    triggerFunction: level1Function,
    nextLevelPointRequirement: 200
}

const level2 = {
    triggerFunction: level2Function,
    nextLevelPointRequirement: 400
}
const level3 = {
    triggerFunction: level3Function,
    nextLevelPointRequirement: 750
}
const level4 = {
    triggerFunction: level4Function,
    nextLevelPointRequirement: 1000
}

const level5 = {
    triggerFunction: level5Function,
    nextLevelPointRequirement: 1500
}

const level6 = {
    triggerFunction: level6Function,
    nextLevelPointRequirement: 2000
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
        this.points = 0;

        this.pointsToCoin = 15; // to adjust
        this.toNextCoin = 0;
        this.coins = 0;

    }
    //initLevel0(rbg:RandomBlockGenerator, cci: ComboChooseInterface, comboEngine?:BlockComboEngine){
    initLevel0(game:GameGrid){
        this.levels = [level0, level1, level2, level3, level4, level5, level6];
        //this.levels[0].triggerFunction(this, rbg, cci);
        this.levels[0].triggerFunction(game);
        //cci.active = true;
    }
    payCoins(c:number):boolean{
        if(c > this.coins) return false;
        this.coins -= c;
        return true;
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
    //addPoints(p:number, rbg:RandomBlockGenerator, 
    //    cci:ComboChooseInterface, ce: BlockComboEngine):AddPointReturn{
    addPoints(p:number, game:GameGrid):AddPointReturn{
        this.points += p;
        this.addPointCoins(p);
        let levelUp = false;
        if(this.checkNextLevel()){
            levelUp = true;
            this.level++;
            if(this.level < this.levels.length)
            //this.levels[this.level].triggerFunction(this, rbg, cci);
            this.levels[this.level].triggerFunction(game);
        }
        return {level: this.level, finishGame: this.level >= this.levels.length,
            levelUp: levelUp
        };
    }
}

export function level0Function(game:GameGrid){
    console.log('loading level 0');
    game.levelManager.coins += 10;
    game.controlledBlockGenerator.addShapeProbability(0, 0.5);
    game.controlledBlockGenerator.addShapeProbability(1, 0.5);
    game.controlledBlockGenerator.addBlockProbability(BlockId.StoneBlock, 0.5);
    game.controlledBlockGenerator.addBlockProbability(BlockId.WoodBlock, 0.5);
    for(let i = 0; i < 6; ++i){
        const combo = BlockCombos.generateCombo(game.controlledBlockGenerator.blockProbabilities, 4);
        game.comboChooseInterface.items[i].setCombo(combo);
    }
    game.blockProbabilityInterface.setData(game.controlledBlockGenerator.blockProbabilities.asList());
    game.shapeProbabilityInterface.setData(game.controlledBlockGenerator.shapeProbabilities.asList());
}

export function level1Function(game:GameGrid){
    const blm = game.levelManager;
    const rbg = game.controlledBlockGenerator;
    const cci = game.comboChooseInterface;
    console.log('loading level 1');
    blm.coins += 10;
    rbg.addShapeProbability(1, 0.1, 0);
    rbg.addShapeProbability(2, 0.1, 1);

    rbg.addBlockProbability(BlockId.ABlock, 0.1, BlockId.StoneBlock);
    rbg.addBlockProbability(BlockId.ABlock, 0.1, BlockId.WoodBlock);
    cci.changeNeedSelected(1);
    for(let i = 0; i < 6; ++i){
        const combo = BlockCombos.generateCombo(rbg.blockProbabilities, 3);
        cci.items[i].setCombo(combo);
    }
    game.abilityBarInterface.addAbility(BlockId.StoneBlock);
    //cci.active = true; add button on combo block interface
}

export function level2Function(game:GameGrid){

    const blm = game.levelManager;
    const rbg = game.controlledBlockGenerator;
    const cci = game.comboChooseInterface;
    console.log('loading level 2');
    blm.coins += 10;
    rbg.addShapeProbability(1, 0.1, 0);
    rbg.addShapeProbability(2, 0.1, 1);
    //rbg.addShapeProbability(3, 0.1, 1);

    rbg.addBlockProbability(BlockId.ABlock, 0.05, BlockId.StoneBlock);
    rbg.addBlockProbability(BlockId.ABlock, 0.05, BlockId.WoodBlock);
    if(cci.needSelected !== 0){
        // add new combo if not selected previous
        //const combo = BlockCombos.generateCombo(rbg.blockProbabilities, 3);
        //comboEngine?.addRandomCombos(combo);
        //cci.
    }
    for(let i = 0; i < 6; ++i){
        const combo = BlockCombos.generateCombo(rbg.blockProbabilities, 4);
        cci.items[i].setCombo(combo);
    }
    cci.changeNeedSelected(0);
    game.abilityBarInterface.addAbility(BlockId.WoodBlock);
    //cci.active = true;
}

export function level3Function(game:GameGrid){

    const blm = game.levelManager;
    const rbg = game.controlledBlockGenerator;
    const cci = game.comboChooseInterface;
    console.log('loading level 3');
    blm.coins += 20;
    rbg.addShapeProbability(1, 0.05, 0);
    rbg.addShapeProbability(2, 0.05, 1);
    //rbg.addShapeProbability(3, 0.05, 1);
    rbg.addShapeProbability(3, 0.05, 2);

    rbg.addBlockProbability(BlockId.FloatBlock, 0.05, BlockId.StoneBlock);
    rbg.addBlockProbability(BlockId.FloatBlock, 0.05, BlockId.WoodBlock);

    cci.changeNeedSelected(1);
    for(let i = 0; i < 6; ++i){
        const combo = BlockCombos.generateCombo(rbg.blockProbabilities, 4);
        cci.items[i].setCombo(combo);
    }

    

}

export function level4Function(game:GameGrid){

    const blm = game.levelManager;
    const rbg = game.controlledBlockGenerator;
    const cci = game.comboChooseInterface;
    console.log('loading level 4');
    blm.coins += 20;
    rbg.addShapeProbability(2, 0.1, 0); 
    rbg.addShapeProbability(3, 0.05, 1);
    rbg.addShapeProbability(3, 0.05, 2);

    rbg.addBlockProbability(BlockId.FloatBlock, 0.05, BlockId.StoneBlock);
    rbg.addBlockProbability(BlockId.FloatBlock, 0.05, BlockId.ABlock);
    rbg.addBlockProbability(BlockId.FloatBlock, 0.05, BlockId.WoodBlock);

    cci.changeNeedSelected(1);
    for(let i = 0; i < 6; ++i){
        const combo = BlockCombos.generateCombo(rbg.blockProbabilities, 5);
        cci.items[i].setCombo(combo);
    }
    game.abilityBarInterface.addAbility(BlockId.ABlock);
}

export function level5Function(game:GameGrid){

    const blm = game.levelManager;
    const rbg = game.controlledBlockGenerator;
    const cci = game.comboChooseInterface;
    console.log('loading level 5');
    blm.coins += 20;
    //rbg.addShapeProbability(1, 0.1, 0);
    rbg.addShapeProbability(3, 0.05, 1);
    //rbg.addShapeProbability(3, 0.05, 2);

    rbg.addBlockProbability(BlockId.SprinkleBlock, 0.02, BlockId.StoneBlock);
    rbg.addBlockProbability(BlockId.SprinkleBlock, 0.02, BlockId.ABlock);
    rbg.addBlockProbability(BlockId.SprinkleBlock, 0.02, BlockId.WoodBlock);
    rbg.addBlockProbability(BlockId.SprinkleBlock, 0.02, BlockId.FloatBlock);

    for(let i = 0; i < 6; ++i){
        const combo = BlockCombos.generateCombo(rbg.blockProbabilities, 5);
        cci.items[i].setCombo(combo);
    }
}

export function level6Function(game:GameGrid){

    const blm = game.levelManager;
    const rbg = game.controlledBlockGenerator;
    const cci = game.comboChooseInterface;
    console.log('loading level 6');
    blm.coins += 20;
    rbg.addShapeProbability(1, 0.1, 0);
    rbg.addShapeProbability(2, 0.1, 1);
    rbg.addShapeProbability(3, 0.05, 1);
    rbg.addShapeProbability(3, 0.05, 2);

    rbg.addBlockProbability(BlockId.SprinkleBlock, 0.03, BlockId.StoneBlock);
    rbg.addBlockProbability(BlockId.SprinkleBlock, 0.03, BlockId.ABlock);
    rbg.addBlockProbability(BlockId.SprinkleBlock, 0.03, BlockId.WoodBlock);
    rbg.addBlockProbability(BlockId.SprinkleBlock, 0.03, BlockId.FloatBlock);
}

/*
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

    rbg.addBlockProbability(BlockId.ABlock, 0.1, BlockId.StoneBlock);
    rbg.addBlockProbability(BlockId.ABlock, 0.1, BlockId.WoodBlock);
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

    rbg.addBlockProbability(BlockId.ABlock, 0.1, BlockId.StoneBlock);
    rbg.addBlockProbability(BlockId.ABlock, 0.1, BlockId.WoodBlock);
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
*/