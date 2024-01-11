import { Point } from "../geometry/geometry";
import { Coordinate2DType, DrawGrid2D, VirtualGrid2D } from "../geometry/grid";
import { VirtRect } from "../geometry/shapes";

import ReactLogo from './../assets/react.svg';
import { BlockInfo, DropBlockPickerInterface } from "./interface";

import { BlockElement, BlockId, DroppingBlock, SolidBlock, generateBlockFromId } from "./blocks";
import { RandomBlockDropper } from "./blockchain";
import { TimedEvent } from "../time/events";
import { GameGrid } from "./game";

export class DebugGameGrid extends GameGrid{
    blockDropper: RandomBlockDropper;

    blockPickInterface: DropBlockPickerInterface;

    constructor(){
        super();

        this.blockDropper = new RandomBlockDropper();
        this.blockPickInterface = new DropBlockPickerInterface(new Point(500, 100), 
        [BlockId.LiquidBlock, BlockId.DirtBlock, BlockId.SedimentBlock]);
    }
    updateGrid(){
        const blocks = [];
        for(let y = this.grid.height-1; y >= 0; --y){
            for(let x = 0; x < this.grid.width; ++x){
                blocks.push(this.grid.getItem(x, y));
                //const block = this.grid.getItem(x, y);
                //block.update(this.grid);
            }
        }
        for(const block of blocks){
            block.update(this.grid);
        }
    }
    update(time:number){
        const blockTicks = this.blockTickEvent.step(time);
        for(let i = 0; i<blockTicks; i++){
            //this.updateGrid();
        }

        //this.spawnBlockUpdate(time);

        if(this.mouseHighlightedCell){
            const mouseBlock = this.grid.getItem(this.mouseHighlightedCell.x, this.mouseHighlightedCell.y);
            this.blockInfo?.parseInfo(mouseBlock);
        }else{
            this.blockInfo?.noInfo();
        }
    }
    spawnBlockUpdate(time:number){
        const blockSpawns = this.blockSpawnEvent.step(time);
        if(blockSpawns){
            //for testing spawn random block on width
            const gridRange = this.grid.getWidthRange();
            const rand = gridRange.getRandom();
            const newBlock = this.addNewBlock(rand, 0);
            if(newBlock && !this.controlledBlock){
                this.controlledBlock = newBlock;
                //console.log(this.controlledBlock);
            }
            if(!newBlock){
                console.log('you lost block cannot be placed');
            }
        }
    }
    mouseMove(e:React.MouseEvent<HTMLCanvasElement>, pos: Point){
        //console.log(pos);
        //this.getFurthestEdge(pos);
        this.mouseHighlightedCell = this.grid.getGridMouseCoordinates(pos);
        //console.log(this.mouseHighlightedCell);
        this.testRect = this.grid.gridRect.smartMouseRectInside(pos, 50, 30, 30);
        //console.log(this.testRect);
    }
    mouseLeftDown(e:React.MouseEvent<HTMLCanvasElement>, pos:Point){
        //console.log(pos);
        if(this.mouseHighlightedCell){
            const block = generateBlockFromId(this.blockPickInterface.picked);
            this.addNewBlock(this.mouseHighlightedCell.x, this.mouseHighlightedCell.y, block);
        }
        this.blockPickInterface.mouseDown(pos);
    }
    mouseLeftUp(e:React.MouseEvent<HTMLCanvasElement>, pos:Point){

    }
    keyDown(e:KeyboardEvent, key:string){
        switch(key){
            case 'a':
                this.blockMoveLeft();
                break;
            case 'd':
                this.blockMoveRight();
                break;
            case ' ':
                this.updateGrid();
                console.log('update grid');
                break;
        }
        if(key === 'q'){
            console.log(this.grid);
        }
    }
    keyUp(e:KeyboardEvent, key:string){

    }
    blockMove(x:number, y:number=0){
        //this.controlledBlock
        if(this.controlledBlock){
            this.controlledBlock.move(this.grid, x, y);
            /*
            const nx = this.controlledBlock.x+x;
            const ny = this.controlledBlock.y+y;
            if(this.grid.isInGrid(nx, ny)){
                const examineBlock = this.grid.getItem(nx, ny);
                if(!examineBlock.isSolid){
                    this.grid.swapGrid(this.controlledBlock.x, 
                        this.controlledBlock.y, nx, ny);
                }
            }
            */
        }
    }
    blockMoveLeft(){
        this.blockMove(-1);
    }
    blockMoveRight(){
        this.blockMove(1);
    }
    addNewBlock(x:number, y:number, block?:DroppingBlock):DroppingBlock | null{
        
        if(this.grid.getItem(x, y).isEmpty){
            //aconst newSolid = this.blockDropper.sedimentBlock(); 
            // drops sediment only
            const newBlock = block ? block : this.blockDropper.randomBlock();
            this.grid.setGrid(x, y, newBlock);
            this.solidBlocks.push(newBlock);
            //console.log('add block');
            return newBlock;
        }
        return null;
    }
    blockTick(){
        for(const block of this.solidBlocks){
            block.update(this.grid);
        }
        if(!this.controlledBlock?.isDropping){
            this.controlledBlock = null;
        }
    }
    drawOverCell(cr:CanvasRenderingContext2D, pt: Point){

    }

    draw(cr:CanvasRenderingContext2D):void{
        this.grid.draw(cr);
        //draw blocks
        /*
        for(const block of this.solidBlocks){
            const position = this.gridPositions.getItem(block.x, block.y);
            //cr.translate(position.x, position.y);
            //cr.scale(this.grid.gridSize, this.grid.gridSize);
            block.draw(cr, this.grid.gridSize, position);
            //cr.resetTransform();
        }*/
        if(this.controlledBlock){
            const position = this.gridPositions.getItem(this.controlledBlock.x, this.controlledBlock.y);
            cr.strokeStyle = 'green';
            cr.strokeRect(position.x, position.y, this.grid.gridSize, this.grid.gridSize);
            //cr.resetTransform();
        }

        if(this.mouseHighlightedCell){
            //const block = this.grid.getItem(this.mouseHighlightedCell.x, this.mouseHighlightedCell.y);
            const position = this.gridPositions.getItem(this.mouseHighlightedCell.x, this.mouseHighlightedCell.y);
            //cr.translate(position.x, position.y);
            //cr.scale(this.grid.gridSize, this.grid.gridSize);
            cr.fillStyle = '#ff000044';
            //console.log(block);
            //block.draw(cr);
            cr.fillRect(position.x, position.y, this.grid.gridSize, this.grid.gridSize);
            //cr.resetTransform();
        }
        if(this.testRect){
            this.testRect.draw(cr);
        }

        if(this.blockInfo) this.blockInfo.draw(cr);
        this.blockPickInterface.draw(cr);
        /*
        if(this.testTexture){
            //textures also scale
            cr.scale(2,2);
            cr.fillStyle = this.testTexture;
            cr.fillRect(0, 0, 500, 500);
            cr.resetTransform();
        }
        */
    }
}