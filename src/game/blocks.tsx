import { Point } from "../geometry/geometry";
import { Coordinate2DType, DrawGrid2D } from "../geometry/grid";
import { BlockParticles } from "../graphics/customParticle";
import { ParticleEffect } from "../graphics/particle";


export enum BlockId {
    Default, StoneBlock, DirtBlock, WoodBlock, SedimentBlock, LiquidBlock, MegaStoneBlock,
}

export const blockTypeStrings = {
    [BlockId.Default]: 'Default',
    [BlockId.StoneBlock]: 'Stone',
    [BlockId.DirtBlock]: 'Dirt',
    [BlockId.WoodBlock]: 'Wood',
    [BlockId.SedimentBlock]: 'Sediment',
    [BlockId.LiquidBlock]: 'Liquid',
    [BlockId.MegaStoneBlock]: 'MegaStone'
}

export function generateDroppingBlockFromId(blockId: BlockId): DroppingBlock{
    switch(blockId){
        case BlockId.StoneBlock:
            return new StoneBlock();
        case BlockId.DirtBlock:
            return new DirtBlock();
        case BlockId.WoodBlock:
            return new WoodBlock();
        case BlockId.SedimentBlock:
            return new SedimentBlock();
        case BlockId.LiquidBlock:
            return new LiquidBlock();
        default:
            console.log('Block not found')
    }
    return new StoneBlock();
}

export class BlockElement implements Coordinate2DType{
    x: number;
    y: number;
    isEmpty: boolean;
    isSolid: boolean;
    isLiquid: boolean;
    //isFalling: boolean; 
    //falling means block is not user controlled and is still in motion

    isControlling: boolean;

    type: BlockId;
    isDropping: boolean;
    value:number;
    colour: string;
    constructor(x?:number, y?:number){
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.isEmpty = true;
        this.isSolid = false;
        this.isLiquid = false;
        //this.isFalling = false;
        this.isDropping = true;
        this.isControlling = false;
        this.type = BlockId.Default;
        this.value = 0;
        this.colour = 'transparent';
    }
    getRelativeBlock(grid:DrawGrid2D<BlockElement>, x:number, y:number):BlockElement | null{
        return grid.getItem(this.x+x, this.y+y);
    }
    getEmpty():boolean{
        return this.isEmpty;
    }
    newCoordinates(x:number, y:number){
        this.x = x;
        this.y = y;
    }
    combine(_blocks: BlockElement[]):BlockElement{
        return new BlockElement(this.x, this.y);
    }
    update(_grid:DrawGrid2D<BlockElement>){
    }
    getDestroyParticles(_grid:DrawGrid2D<BlockElement>):ParticleEffect[]{
        return [];
    }
    getInfo():any{
        return {...this};
    }
    draw(cr:CanvasRenderingContext2D, size:number=1, position?:Point):void{
        //cr.fillStyle = this.colour;
        //const x = position ? position.x : 0;
        //const y = position ? position.y : 0;
        //cr.fillRect(x, y, size, size);
    }
}

//blocks that drop (user can control)
export class DroppingBlock extends BlockElement{
    isDropping: boolean;
    constructor(x?:number, y?:number){
        super(x, y);
        this.isDropping = true;
        this.isEmpty = false;
    }
    move(grid:DrawGrid2D<BlockElement>, x:number, y:number=0){
        const nx = this.x+x;
        const ny = this.y+y;
        if(grid.isInGrid(nx, ny)){
            const examineBlock = grid.getItem(nx, ny);
            if(!examineBlock.isSolid){
                grid.swapGrid(this.x, 
                    this.y, nx, ny);
            }
        }
    }
    checkUnderIsBlock(grid:DrawGrid2D<BlockElement>):boolean{
        const yd1 = this.y + 1;
        if(grid.isInGrid(this.x, yd1)){
            const underBlock = grid.getItem(this.x, yd1);
            return !underBlock.isEmpty;
        }
        return true;
    }
    getDropCondition(b:BlockElement):boolean{
        return !b.isSolid && !this.isControlling;
    }
    updateDrop(grid:DrawGrid2D<BlockElement>):boolean{
        if(this.isControlling) return true;
        //if(this.isDropping){
            const yd1 = this.y + 1;
            if(grid.isInGrid(this.x, yd1)){
                //dropping
                const underBlock = grid.getItem(this.x, yd1);
                if(this.getDropCondition(underBlock)){
                    grid.swapGrid(this.x, this.y, this.x, yd1);
                    return true;
                }
            }
            this.isDropping = false;
        //}
        return false;
    }
    update(grid:DrawGrid2D<BlockElement>){
        this.updateDrop(grid);
    }
    draw(cr:CanvasRenderingContext2D, size:number=1, position?:Point):void{
        cr.fillStyle = this.colour;
        const x = position ? position.x : 0;
        const y = position ? position.y : 0;
        cr.fillRect(x, y, size, size);
    }
}

export class SolidBlock extends DroppingBlock{
    //isFalling: boolean;
    constructor(x?:number, y?:number){
        super(x, y);
        this.isSolid = true;
        //this.isFalling = true; 
    }
    update(grid:DrawGrid2D<BlockElement>){
        super.update(grid);
    }
}
export class WoodBlock extends SolidBlock{
    constructor(x?:number, y?:number){
        super(x, y);
        this.type = BlockId.WoodBlock;
        this.colour = 'grey';
    }
    draw(cr:CanvasRenderingContext2D, size:number=1, position?:Point):void{
        //cr.fillStyle = 'grey';
        //cr.fillRect(0, 0, 1, 1);
        super.draw(cr, size, position);
    }
}

export class StoneBlock extends SolidBlock{
    constructor(x?:number, y?:number){
        super(x, y);
        this.type = BlockId.StoneBlock;
        this.colour = 'white';
    }
    //if next to another stone block remove
    checkCombo(grid:DrawGrid2D<BlockElement>):boolean{
        const b1Block = this.getRelativeBlock(grid, 0, 1);
        if(b1Block && b1Block.type === BlockId.StoneBlock){
            return true;
        }
        return false;
    }
    combine(blocks: BlockElement[]):BlockElement{
        //can use blocks to customise combine
        return new MegaStoneBlock();
    }
    getDestroyParticles(grid: DrawGrid2D<BlockElement>): ParticleEffect[] {
        const p1 = BlockParticles.gridDroppingSquare(this.x, this.y, grid, this.colour);
        const p2 = BlockParticles.gridDroppingSquare(this.x, this.y, grid, this.colour);
        return [p1, p2];
    }
    draw(cr:CanvasRenderingContext2D, size:number=1, position?:Point):void{
        //cr.fillStyle = 'white';
        //cr.fillRect(0, 0, 1, 1);
        super.draw(cr, size, position);
    }
}

export class MegaStoneBlock extends StoneBlock{
    constructor(x?:number, y?:number){
        super(x, y);
        this.type = BlockId.MegaStoneBlock;
        this.colour = 'red';
    }
    draw(cr:CanvasRenderingContext2D, size:number=1, position?:Point):void{
        //cr.fillStyle = 'white';
        //cr.fillRect(0, 0, 1, 1);
        super.draw(cr, size, position);
    }
}

export class SedimentBlock extends DroppingBlock{
    constructor(x?:number, y?:number){
        super(x, y);
        this.isSolid = true;
        this.type = BlockId.SedimentBlock;
        this.colour = 'yellow';
    }
    dropSide(grid:DrawGrid2D<BlockElement>, x:number, block:BlockElement):boolean{
        const sideBlock = grid.getItem(x, this.y);
        if(sideBlock.isSolid){
            grid.swapGrid(this.x, this.y, x, this.y+1);
        }else{
            grid.setGrid(this.x, this.y, sideBlock)//side block to this blocks position
            grid.setGrid(x, this.y, block) //block moves to side position
            grid.setGrid(x, this.y+1, this); //fall to block position
        }
        this.isDropping = true;
        return true;
    }
    update(grid:DrawGrid2D<BlockElement>){
        const updatedDrop = this.updateDrop(grid);
        if(!updatedDrop) this.updateSediment(grid);
    }
    //
    updateSediment(grid:DrawGrid2D<BlockElement>):boolean{
        if(!this.isDropping){
            const yd1 = this.y+1;
            const xl1 = this.x-1;
            const xr1 = this.x+1;
            const bottomLeftBlock = grid.isInGrid(xl1, yd1) ? grid.getItem(xl1, yd1) : null;
            const bottomRightBlock = grid.isInGrid(xr1, yd1) ? grid.getItem(xr1, yd1) : null;
            if(bottomLeftBlock){
                if(bottomRightBlock){
                    //both sides
                    return this.decideDropSide(grid, xl1, xr1, bottomLeftBlock, bottomRightBlock);
                }else{
                    //only left
                    //if(!bottomLeftBlock.isSolid){
                    if(this.getDropCondition(bottomLeftBlock)){
                        return this.dropSide(grid, xl1, bottomLeftBlock);
                    }
                }
            }
            else if(bottomRightBlock){
                //only right
                //if(!bottomRightBlock.isSolid){
                if(this.getDropCondition(bottomRightBlock)){
                    return this.dropSide(grid, xr1, bottomRightBlock);
                } 
            }

        }
        return false;
    }
    decideDropSide(grid:DrawGrid2D<BlockElement>, xl:number, xr:number, 
        blockLeft:BlockElement, blockRight:BlockElement):boolean{
        //if(blockLeft.isSolid){
        if(!this.getDropCondition(blockLeft)){
            //not left
            //if(!blockRight.isSolid){
            if(this.getDropCondition(blockRight)){
                return this.dropSide(grid, xr, blockRight); // drop right
            }
        }else{
            //yes left
            //if(blockRight.isSolid){
            if(!this.getDropCondition(blockRight)){
                //not right so can only be left
                return this.dropSide(grid, xl, blockLeft); // drop left
            }else{
                //both (select at random)
                const r = Math.random();
                if(r < 0.5){
                    return this.dropSide(grid, xl, blockLeft);
                }else{
                    return this.dropSide(grid, xr, blockRight);
                }
            }
        }
        return false;
    }
}

export class DirtBlock extends SedimentBlock{
    constructor(x?:number, y?:number){
        super(x, y);
        this.type = BlockId.DirtBlock;
        this.colour = 'brown';
    }
    draw(cr:CanvasRenderingContext2D, size:number=1, position?:Point):void{
        //cr.fillStyle = 'brown';
        //cr.fillRect(0, 0, 1, 1);
        super.draw(cr, size, position);
    }
}

export class LiquidBlock extends SedimentBlock{
    //scanne
    constructor(x?:number, y?:number){
        super(x, y);
        this.isLiquid = true;
        this.isSolid = false;
        this.type = BlockId.LiquidBlock;
        this.colour = 'blue';
    }

    searchLeft(grid:DrawGrid2D<BlockElement>): number | null{
        const yd1 = this.y+1;
        if(!grid.isInY(yd1)) return null;
        const leftBlocks = grid.getLeftItems(this.x, this.y);
        const leftBlocksUnder = grid.getLeftItems(this.x, yd1);
        return this.searchSides(leftBlocks, leftBlocksUnder);
    }
    searchRight(grid:DrawGrid2D<BlockElement>): number | null{
        const yd1 = this.y+1;
        if(!grid.isInY(yd1)) return null;
        const rightBlocks = grid.getRightItems(this.x, this.y);
        const rightBlocksUnder = grid.getRightItems(this.x, yd1);
        return this.searchSides(rightBlocks, rightBlocksUnder);
    }
    searchSides(levelBlocks:BlockElement[], underBlocks:BlockElement[]):number | null{
        let n = 0;
        for(const block of levelBlocks){
            n+=1;
            if(!block.isEmpty) break;
        }
        for(let i = 0; i < n; i++){
            if(underBlocks[i].isEmpty) return i;
        }
        return null;
    }
    getDropCondition(b:BlockElement):boolean{
        return !b.isLiquid && !b.isSolid && !this.isControlling;
    }
    /*
    updateDrop(grid:DrawGrid2D<BlockElement>):boolean{
        if(this.isDropping){
            const yd1 = this.y + 1;
            if(grid.isInGrid(this.x, yd1)){
                //dropping
                const underBlock = grid.getItem(this.x, yd1);
                if(this.getDropCondition(underBlock)){
                    grid.swapGrid(this.x, this.y, this.x, yd1);
                    return true;
                }
            }
            this.isDropping = false;
        }
        return false;
    }*/
    update(grid:DrawGrid2D<BlockElement>){
        if(this.updateDrop(grid)) return;
        if(this.updateSediment(grid)) return;
        this.updateLiquid(grid);
    }
    updateLiquid(grid:DrawGrid2D<BlockElement>){
        //run the water sim
        //search both sides
        const searchLeft = this.searchLeft(grid);
        const searchRight = this.searchRight(grid);
        if(!searchLeft){
            if(searchRight){
                //move right
                grid.swapGrid(this.x, this.y, this.x+1, this.y);
            }
        }else{
            if(searchRight){
                //both
                if(searchLeft < searchRight){
                    grid.swapGrid(this.x, this.y, this.x-1, this.y);
                }else if(searchLeft === searchRight){
                    this.moveRandomSide(grid);
                }else{
                    grid.swapGrid(this.x, this.y, this.x+1, this.y);
                }
            }else{
                //moveLeft
                grid.swapGrid(this.x, this.y, this.x-1, this.y);
            }
        }
    }
    
    moveRandomSide(grid:DrawGrid2D<BlockElement>){
        const r = Math.random();
        if(r < 0.5){
            grid.swapGrid(this.x, this.y, this.x+1, this.y);
        }else{
            grid.swapGrid(this.x, this.y, this.x-1, this.y);
        }
    }
    /*
    draw(cr:CanvasRenderingContext2D, size:number=1, position?:Point):void{
        cr.fillStyle = 'blue';
        const x = position ? position.x : 0;
        const y = position ? position.y : 0;
        cr.fillRect(x, y, size, size);
    }
    */
}