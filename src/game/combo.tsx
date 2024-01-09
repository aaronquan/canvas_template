
import { DrawGrid2D } from "../geometry/grid";
import { BlockElement } from "./blocks";


//enum ComboType

export class BlockCombo {
    blocks: BlockElement[];
    executed: boolean;
    isDestroy: boolean;
    constructor(startingBlocks: BlockElement[]){
        this.blocks = startingBlocks;
        this.executed = false;
        this.isDestroy = true;
    }
    addToCombo(ele:BlockElement){
        this.blocks.push(ele);
    }
    execute(grid:DrawGrid2D<BlockElement>){
        if(!this.executed){
            for(const block of this.blocks){
                if(this.isDestroy){
                    grid.setGrid(block.x, block.y, new BlockElement());
                }
            }
        }
        this.executed = true;
    }
}

export class CombineCombo extends BlockCombo{
    mainElement: BlockElement;
    constructor(startingBlocks: BlockElement[], main: BlockElement){
        super(startingBlocks);
        this.mainElement = main;
    }
    execute(grid:DrawGrid2D<BlockElement>){
        
    }
}