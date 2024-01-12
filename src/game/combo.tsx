
import { Point } from "../geometry/geometry";
import { DrawGrid2D } from "../geometry/grid";
import { ParticleEffect } from "../graphics/particle";
import { randomArrayElement } from "../math/Random";
import { BlockElement } from "./blocks";
import { BlockCombos } from "./customCombos";


//enum ComboType

export type ComboFunction = (grid:DrawGrid2D<BlockElement>, ...args: any[]) => BlockCombo[];

type ComboFunctionArgs = {
    function: (grid:DrawGrid2D<BlockElement>, ...args: any[]) => BlockCombo[];
    args?: any[];
}

export type PointEffect = {
    value: number;
    position: Point;
}

export type ComboEffects = {
    particleEffects: ParticleEffect[];
    pointEffects: PointEffect[];
}

export type ComboExecutionReturn = {

}

export class BlockComboEngine{
    combos: BlockCombo[];
    comboFunctions: ComboFunctionArgs[];
    multiplier: number;

    randomCombos: BlockCombos.BlockComboBlocks[] // playerPicked
    
    constructor(){
        this.combos = [];
        this.comboFunctions = [];
        this.multiplier = 1;

        this.randomCombos = [];
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
    addRandomCombos(combo: BlockCombos.BlockComboBlocks){
        this.randomCombos.push(combo);
    }
    findCombos(grid:DrawGrid2D<BlockElement>){
        for(const fn of this.comboFunctions){
            const newCombos = fn.args ? fn.function(grid, ...fn.args) : fn.function(grid);
            this.addCombos(newCombos);
        }
        for(const combo of this.randomCombos){
            const newCombos = BlockCombos.findCombo(grid, combo);
            this.addCombos(newCombos);
        }
    }
    execute(grid:DrawGrid2D<BlockElement>):ComboEffects{
        const particles:ParticleEffect[] = [];
        const pointEffects:PointEffect[] = [];
        for(const combo of this.combos){
            //console.log(combo);
            const effects:ComboEffects = combo.execute(grid, this.multiplier);
            particles.push(...effects.particleEffects);
            pointEffects.push(effects.pointEffects[0]);
        }
        this.combos = [];
        return {
            particleEffects: particles,
            pointEffects: pointEffects,
        };
    }
    drawCombos(cr:CanvasRenderingContext2D, x:number, y:number){
        const tr = cr.getTransform();
        cr.translate(x, y);
        let ny = 0;
        const blockSize = 32;
        for(const combo of this.randomCombos){
            BlockCombos.drawCombo(cr, combo.blocks, blockSize, 10, 10+ny);
            ny += (combo.range.maxY+1)*blockSize + 10;
        }
        cr.setTransform(tr);
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
        let points = 0;
        for(const block of this.blocks){
            if(this.isDestroy){
                grid.setGrid(block.x, block.y, new BlockElement());
            }
            points += block.value;
            particles.push(...block.getDestroyParticles(grid));
        }
        points *= this.blocks.length;
        const randBlock = randomArrayElement(this.blocks);
        let position = new Point();
        if(randBlock){
            position = grid.getGridPosition(randBlock.x, randBlock.y);
        }
        const pointEffect: PointEffect = {
            value: points,
            position: position
        };
        return {
            particleEffects: particles,
            pointEffects: [pointEffect]
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