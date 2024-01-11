import { DrawGrid2D } from "../geometry/grid";
import { BlockElement, BlockId } from "./blocks";
import { BlockCombo, CombineCombo } from "./combo";

//interface ComboFunction

namespace CustomBlockCombos{

    export function findNHorizontalCombo(grid:DrawGrid2D<BlockElement>, n:number=5, 
        blockType:BlockId=BlockId.StoneBlock): BlockCombo[]{
        const combos = [];
        for(let y = 0; y < grid.height; ++y){
            const row = grid.getRow(y);
            
            //let comboCount = 0;
            let currentCombo = new BlockCombo([]);
            let currentBlocks:BlockElement[] = [];
            for(let i = 0; i<row.length; ++i){
                const block = row[i];
                if(!block.isDropping && block.type === blockType){
                //if(block.type === BlockId.StoneBlock){
                    currentBlocks.push(block);
                    //comboCount++;
                }else{
                    //comboCount = 0;
                    currentBlocks = [];
                }
                if(currentBlocks.length === n){ // 2 combo blocks
                    //create new combo
                    currentCombo = new BlockCombo(currentBlocks);
                    combos.push(currentCombo);
                }else if(currentBlocks.length > n){
                    // add to combo
                    //currentCombo.addToCombo(block);
                }
            }
        }
        return combos;
    }

    export function findNVerticalCombo(grid:DrawGrid2D<BlockElement>, n:number=2, blockType:BlockId=BlockId.StoneBlock): BlockCombo[]{
        const combos = [];
        for(let x = 0; x < grid.width; ++x){
            let currentCombo = new BlockCombo([]);
            let currentBlocks:BlockElement[] = [];
            for(let y = grid.height - 1 ; y >= 0; --y){
                const block = grid.getItem(x, y);
                //console.log(currentBlocks);
                if(!block.isDropping && block.type === blockType){
                    currentBlocks.push(block);
                }else{
                    currentBlocks = [];
                }
                if(currentBlocks.length === n){ // 2 combo blocks
                    //create new combo
                    currentCombo = new BlockCombo(currentBlocks);
                    combos.push(currentCombo);
                }else if(currentBlocks.length > n){
                    // add to combo
                    //currentCombo.addToCombo(block);
                }
            }
        }
        return combos;
    }

    export function findNVerticalCombineCombo(grid:DrawGrid2D<BlockElement>, 
        n:number=2, blockType:BlockId=BlockId.StoneBlock): BlockCombo[]{
        const combos = [];
        for(let x = 0; x < grid.width; ++x){
            let currentCombo = new BlockCombo([]);
            let currentBlocks:BlockElement[] = [];
            for(let y = grid.height - 1 ; y >= 0; --y){
                const block = grid.getItem(x, y);
                //console.log(currentBlocks);
                if(!block.isDropping && block.type === blockType){
                    currentBlocks.push(block);
                }else{
                    currentBlocks = [];
                }
                if(currentBlocks.length === n){ // 2 combo blocks
                    //create new combo
                    currentCombo = new CombineCombo(currentBlocks, currentBlocks[0]);
                    combos.push(currentCombo);
                }else if(currentBlocks.length > n){
                    // add to combo
                    //currentCombo.addToCombo(block);
                }
            }
        }
        return combos;
    }

    export function findDirtWaterCombo(grid:DrawGrid2D<BlockElement>): BlockCombo[]{
        const combos: BlockCombo[] = []
        for(let x = 0; x < grid.width; ++x){
            //let currentCombo = new BlockCombo([]);
            let currentBlocks:BlockElement[] = [];
            //let lookFor: BlockId | null = null;
            for(let y = grid.height - 1 ; y >= 0; --y){
                const block = grid.getItem(x, y);
                if(!block.isDropping){
                    if(currentBlocks.length === 0){
                        if(block.type === BlockId.WaterBlock || BlockId.DirtBlock){
                            currentBlocks.push(block);
                        }
                    }else{
                        if(currentBlocks[0].type === BlockId.WaterBlock){
                            if(block.type === BlockId.DirtBlock){
                                currentBlocks.push(block);
                                combos.push(new CombineCombo(currentBlocks, currentBlocks[1]));
                                //currentBlocks = [];
                            }
                        }else if(currentBlocks[0].type === BlockId.DirtBlock){
                            if(block.type === BlockId.WaterBlock){
                                currentBlocks.push(block);
                                combos.push(new CombineCombo(currentBlocks, currentBlocks[0]));
                                //currentBlocks = [];
                            }
                        }
                        currentBlocks = [];
                    }
                }else{
                    currentBlocks = [];
                }
            }
        }
        return combos;
    }   

}

export default CustomBlockCombos;