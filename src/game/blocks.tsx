import { Point } from "../geometry/geometry";
import { Coordinate2DType, DrawGrid2D } from "../geometry/grid";


export enum BlockIds {
    Default, StoneBlock, DirtBlock, WoodBlock, SedimentBlock, LiquidBlock
}

export const blockTypeStrings = {
    [BlockIds.Default]: 'Default',
    [BlockIds.StoneBlock]: 'Stone',
    [BlockIds.DirtBlock]: 'Dirt',
    [BlockIds.WoodBlock]: 'Wood',
    [BlockIds.SedimentBlock]: 'Sediment',
    [BlockIds.LiquidBlock]: 'Liquid'
}

export class BlockElement implements Coordinate2DType{
    x: number;
    y: number;
    isEmpty: boolean;
    isSolid: boolean;
    isLiquid: boolean;
    isFalling: boolean; 
    //falling means block is not user controlled and is still in motion
    type: BlockIds;
    //isDropping: boolean;
    constructor(x?:number, y?:number){
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.isEmpty = true;
        this.isSolid = false;
        this.isLiquid = false;
        this.isFalling = false;
        this.type = BlockIds.Default;
    }
    newCoordinates(x:number, y:number){
        this.x = x;
        this.y = y;
    }
    update(_grid:DrawGrid2D<BlockElement>){
    }
    getInfo():any{
        return {...this};
    }
    draw(cr:CanvasRenderingContext2D, size:number=1, position?:Point):void{
        const x = position ? position.x : 0;
        const y = position ? position.y : 0;
        cr.fillRect(x, y, size, size);
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
    updateDrop(grid:DrawGrid2D<BlockElement>):boolean{
        if(this.isDropping){
            const yd1 = this.y + 1;
            if(grid.isInGrid(this.x, yd1)){
                //dropping
                const underBlock = grid.getItem(this.x, yd1);
                if(!underBlock.isSolid){
                    grid.swapGrid(this.x, this.y, this.x, yd1);
                    return true;
                }else{
                    //this.isDropping = false;
                }
            }
            /*else{
                this.isDropping = false;
            }*/
            this.isDropping = false;
        }
        return false;
    }
    update(grid:DrawGrid2D<BlockElement>){
        this.updateDrop(grid);
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
    /*
    draw(cr:CanvasRenderingContext2D, size:number=1, position?:Point):void{
        //cr.fillStyle = 'blue';
        //cr.fillRect(0, 0, 1, 1);
        super.draw(cr, size, position);
    }*/
}

export class DirtBlock extends SolidBlock{
    constructor(x?:number, y?:number){
        super(x, y);
        this.type = BlockIds.DirtBlock;
    }
    draw(cr:CanvasRenderingContext2D, size:number=1, position?:Point):void{
        cr.fillStyle = 'brown';
        //cr.fillRect(0, 0, 1, 1);
        super.draw(cr, size, position);
    }
}

export class WoodBlock extends SolidBlock{
    constructor(x?:number, y?:number){
        super(x, y);
        this.type = BlockIds.WoodBlock;
    }
    draw(cr:CanvasRenderingContext2D, size:number=1, position?:Point):void{
        cr.fillStyle = 'grey';
        //cr.fillRect(0, 0, 1, 1);
        super.draw(cr, size, position);
    }
}

export class StoneBlock extends SolidBlock{
    constructor(x?:number, y?:number){
        super(x, y);
        this.type = BlockIds.StoneBlock;
    }
    draw(cr:CanvasRenderingContext2D, size:number=1, position?:Point):void{
        cr.fillStyle = 'white';
        //cr.fillRect(0, 0, 1, 1);
        super.draw(cr, size, position);
    }
}

export class SedimentBlock extends DroppingBlock{
    constructor(x?:number, y?:number){
        super(x, y);
        this.isSolid = true;
        this.type = BlockIds.SedimentBlock;
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
        //grid.swapGrid(this.x, this.y, x, this.y+1);
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
                    if(!bottomLeftBlock.isSolid){
                        return this.dropSide(grid, xl1, bottomLeftBlock);
                    }
                }
            }
            else if(bottomRightBlock){
                //only right
                if(!bottomRightBlock.isSolid) return this.dropSide(grid, xr1, bottomRightBlock);
            }

        }
        return false;
    }
    decideDropSide(grid:DrawGrid2D<BlockElement>, xl:number, xr:number, 
        blockLeft:BlockElement, blockRight:BlockElement):boolean{
        if(blockLeft.isSolid){
            //not left
            if(!blockRight.isSolid){
                return this.dropSide(grid, xr, blockRight); // drop right
            }
        }else{
            //yes left
            if(blockRight.isSolid){
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
    draw(cr:CanvasRenderingContext2D, size:number=1, position?:Point):void{
        cr.fillStyle = 'yellow';
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
        this.type = BlockIds.LiquidBlock;
    }

    searchLeft(grid:DrawGrid2D<BlockElement>): number | null{
        const yd1 = this.y+1;
        if(!grid.isInY(yd1)) return null;
        const leftBlocks = grid.getLeftItems(this.x, this.y);
        const leftBlocksUnder = grid.getLeftItems(this.x, yd1);
        return this.searchSides(leftBlocks, leftBlocksUnder);
        /*
        let nLeft = 0;
        for(const block of leftBlocks){
            if(!block.isEmpty) break;
            nLeft+=1;
        }
        for(let i = 0; i < nLeft; i++){
            if(searchLeftD1[i].isEmpty) return i;
        }

        return null;
        */
    }
    searchRight(grid:DrawGrid2D<BlockElement>): number | null{
        const yd1 = this.y+1;
        if(!grid.isInY(yd1)) return null;
        const rightBlocks = grid.getRightItems(this.x, this.y);
        const rightBlocksUnder = grid.getRightItems(this.x, yd1);
        return this.searchSides(rightBlocks, rightBlocksUnder);
        /*
        let nRight = 0;
        for(const block of rightBlocks){
            if(!block.isEmpty) break;
            nRight+=1;
        }
        const searchRightD1 = grid.getRightItems(this.x, yd1);
        for(let i = 0; i < nRight; i++){
            if(searchRightD1[i].isEmpty) return i;
        }

        return null;*/
    }
    searchSides(levelBlocks:BlockElement[], underBlocks:BlockElement[]):number | null{
        let nRight = 0;
        for(const block of levelBlocks){
            if(!block.isEmpty) break;
            nRight+=1;
        }
        for(let i = 0; i < nRight; i++){
            if(underBlocks[i].isEmpty) return i;
        }
        return null;
    }
    update(grid:DrawGrid2D<BlockElement>){
        if(this.updateDrop(grid)) return;
        if(this.updateSediment(grid)) return;
        this.updateLiquid(grid);
    }
    updateLiquid(grid:DrawGrid2D<BlockElement>){
        if(!this.updateSediment(grid)){
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
        };
    }
    moveRandomSide(grid:DrawGrid2D<BlockElement>){
        const r = Math.random();
        if(r < 0.5){
            grid.swapGrid(this.x, this.y, this.x+1, this.y);
        }else{
            grid.swapGrid(this.x, this.y, this.x-1, this.y);
        }
    }

    draw(cr:CanvasRenderingContext2D, size:number=1, position?:Point):void{
        cr.fillStyle = 'blue';
        //cr.fillRect(0, 0, 1, 1);
        super.draw(cr, size, position);
    }
}