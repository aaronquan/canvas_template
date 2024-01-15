import { Point } from "../geometry/geometry";
import { DrawGrid2D } from "../geometry/grid";
import { Probabilities, randomArrayElement } from "../math/Random";
import { BlockElement, BlockId, generateBlockFromId } from "./blocks";
import { BlockShape, comboShape3, comboShape4, comboShape5, comboShape6 } from "./blockshapes";
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



export namespace BlockCombos{
    type BlockRange = {
        maxX: number;
        maxY: number;
    }
    export type BlockComboBlocks = {
        blocks: CBlock[];
        range: BlockRange
    }
    export function newBlockComboBlocks(): BlockComboBlocks{
        return {
            blocks: [],
            range: {
                maxX: 0,
                maxY: 0
            }
        }
    }

    export type CBlock = {
        x: number;
        y: number;
        id: BlockId;
    }
    export function generateCombo(blockProbabilities:Probabilities<BlockId>, shapeFind:number=0):BlockComboBlocks{
        let shapeArray = [];
        switch(shapeFind){
            case 3:
                shapeArray = comboShape3;
                break;
            case 4:
                shapeArray = comboShape4;
                break;
            case 5:
                shapeArray = comboShape5;
                break;
            case 6:
                shapeArray = comboShape6;
                break;
            default:
                shapeArray = comboShape3;
                break;
        }
        //console.log(shapeArray);
        const shape:BlockShape | null = randomArrayElement(shapeArray);
        if(shape){
            const range = getBlockRange(shape);
            const combo:CBlock[] = shape?.map((pos) => {
                const id = blockProbabilities.roll();
                if(id) return {...pos, id: id};
                return {...pos, id: BlockId.StoneBlock};
            });
            return {
                blocks: combo,
                range: range
            };
        }
        return newBlockComboBlocks();
    }

    export function getBlockRange(shape:BlockShape): BlockRange{
        if(shape.length === 0) return {
            maxX: 0, maxY: 0
        }
        const ranges = {
            maxX: shape[0].x, maxY: shape[0].y,
        }
        for(let i = 1; i < shape.length; i++){
            if(shape[i].x > ranges.maxX) ranges.maxX = shape[i].x;
            if(shape[i].y > ranges.maxY) ranges.maxY = shape[i].y;
        }
        return ranges;
    }
    function isRangeFits(x:number, y:number, 
        grid:DrawGrid2D<BlockElement>, range:BlockRange): boolean{
        return grid.isInGrid(x+range.maxX, y+range.maxY);
    }
    
    export function findCombo(grid:DrawGrid2D<BlockElement>, combo:BlockComboBlocks): BlockCombo[]{
        const combos: BlockCombo[] = [];
        for(let x = 0; x < grid.width - combo.range.maxX; ++x){
            for(let y = grid.height - 1 - combo.range.maxY ; y >= 0; --y){
                let found = true;
                const blocks = [];
                for(const block of combo.blocks){
                    const gridBlock = grid.getItem(x+block.x, y+block.y);
                    if(!(gridBlock.type === block.id) || gridBlock.isDropping){
                        found = false;
                        break;
                    }
                    blocks.push(gridBlock);
                }
                if(found){
                    const blockCombo = new BlockCombo(blocks);
                    combos.push(blockCombo);
                }
            }
        }
        return combos;
    }

    export function drawCombo(cr:CanvasRenderingContext2D, combo:CBlock[], 
        size: number, x:number, y: number){
        for(const cb of combo){
            const block = generateBlockFromId(cb.id);
            block.draw(cr, size, new Point(x+cb.x*size, y+cb.y*size));
        }
    }

}

export default CustomBlockCombos;