
import { DrawGrid2D } from "../geometry/grid";
import { ParticleEffect } from "../graphics/particle";
import { BlockElement } from "./blocks";


//enum ComboType

export type ComboFunction = (grid:DrawGrid2D<BlockElement>, ...args: any[]) => BlockCombo[];

type ComboFunctionArgs = {
    function: (grid:DrawGrid2D<BlockElement>, ...args: any[]) => BlockCombo[];
    args?: any[];
}


export type ComboEffects = {
    particleEffects: ParticleEffect[];
}

export type ComboExecutionReturn = {

}

export class BlockComboEngine{
    combos: BlockCombo[];
    comboFunctions: ComboFunctionArgs[];
    multiplier: number
    constructor(){
        this.combos = [];
        this.comboFunctions = [];
        this.multiplier = 1;
    }
    hasCombos():boolean{
        return this.combos.length > 0;
    }
    addComboFunction(fn:ComboFunction, args?: any[]){
        this.comboFunctions.push({function: fn, args: args});
    }
    addCombos(combos: BlockCombo[]){
        this.combos.push(...combos);
    }
    findCombos(grid:DrawGrid2D<BlockElement>){
        for(const fn of this.comboFunctions){
            const newCombos = fn.args ? fn.function(grid, ...fn.args) : fn.function(grid);
            this.addCombos(newCombos);
        }
    }
    execute(grid:DrawGrid2D<BlockElement>):ComboEffects{
        const particles:ParticleEffect[] = [];
        for(const combo of this.combos){
            //console.log(combo);
            const effects = combo.execute(grid, this.multiplier);
            particles.push(...effects.particleEffects);
        }
        this.combos = [];
        return {
            particleEffects: particles
        };
    }
}

export class BlockCombo {
    blocks: BlockElement[];
    //executed: boolean;
    isDestroy: boolean;
    constructor(startingBlocks: BlockElement[]){
        this.blocks = startingBlocks;
        //this.executed = false;
        this.isDestroy = true;
    }
    addToCombo(ele:BlockElement){
        this.blocks.push(ele);
    }
    execute(grid:DrawGrid2D<BlockElement>, multiplier:number):ComboEffects{
        const particles = [];
        //if(!this.executed){
        for(const block of this.blocks){
            if(this.isDestroy){
                grid.setGrid(block.x, block.y, new BlockElement());
            }
            particles.push(...block.getDestroyParticles(grid));
        }
        //}
        //this.executed = true;
        return {
            particleEffects: particles
        }
    }
}

export class CombineCombo extends BlockCombo{
    mainElement: BlockElement;
    constructor(startingBlocks: BlockElement[], main: BlockElement){
        super(startingBlocks);
        this.mainElement = main;
    }
    execute(grid:DrawGrid2D<BlockElement>, multiplier:number):ComboEffects{
        //if(!this.executed){
        const effects = super.execute(grid, multiplier);
        const newBlock = this.mainElement.combine(this.blocks);
        grid.setGrid(this.mainElement.x, this.mainElement.y, newBlock);
        return effects;
        //}
        //this.executed = true;
    }
}