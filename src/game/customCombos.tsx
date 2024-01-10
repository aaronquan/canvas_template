import { DrawGrid2D } from "../geometry/grid";
import { BlockElement, BlockId } from "./blocks";
import { BlockCombo, CombineCombo } from "./combo";

//interface ComboFunction

namespace CustomBlockCombos{

    export function findNHorizontalStoneCombo(grid:DrawGrid2D<BlockElement>, n:number=5): BlockCombo[]{
        const combos = [];
        for(let y = 0; y < grid.height; ++y){
            const row = grid.getRow(y);
            
            //let comboCount = 0;
            let currentCombo = new BlockCombo([]);
            let currentBlocks:BlockElement[] = [];
            for(let i = 0; i<row.length; ++i){
                const block = row[i];
                if(!block.isDropping && block.type === BlockId.StoneBlock){
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

    export function findVerticalStoneCombo(grid:DrawGrid2D<BlockElement>, n:number=2): BlockCombo[]{
        const combos = [];
        for(let x = 0; x < grid.width; ++x){
            let currentCombo = new BlockCombo([]);
            let currentBlocks:BlockElement[] = [];
            for(let y = grid.height - 1 ; y >= 0; --y){
                const block = grid.getItem(x, y);
                //console.log(currentBlocks);
                if(!block.isDropping && block.type === BlockId.StoneBlock){
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

    export function find2VerticalDirtCombo(){

    }

}

export default CustomBlockCombos;