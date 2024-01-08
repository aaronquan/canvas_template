import { Point } from "../geometry/geometry";
import { Coordinate2DType, DrawGrid2D, VirtualGrid2D } from "../geometry/grid";
import { VirtRect } from "../geometry/shapes";

import ReactLogo from './../assets/react.svg';
import { BlockInfo } from "./interface";

import { BlockElement, SolidBlock } from "./blocks";
import { RandomBlockDropper } from "./blockchain";

const svg = document.createElementNS(ReactLogo, 'svg');

export class GameGrid{
    grid: DrawGrid2D<BlockElement>;
    gridPositions: VirtualGrid2D<Point>;

    solidBlocks: BlockElement[];

    controlledBlock: SolidBlock | null;

    mouseHighlightedCell: Point | null;

    testRect: VirtRect | null;

    blockSpawnEvent: TimedEvent;
    blockTickEvent: TimedEvent;

    blockInfo: BlockInfo | null; // todo complete after coding 

    testTexture: CanvasPattern | null;

    blockDropper: RandomBlockDropper;

    constructor(){
        console.log('init game');
        this.grid = new DrawGrid2D<BlockElement>(BlockElement, new Point(50, 50), 10, 20, 40);
        this.gridPositions = this.grid.getGridPositionsMap();
        this.solidBlocks = [];

        this.controlledBlock = null;

        this.mouseHighlightedCell = null;
        this.blockSpawnEvent = new TimedEvent(1000);
        this.blockTickEvent = new TimedEvent(32);

        this.testRect = null;

        this.blockInfo = new BlockInfo(new Point(500, 400));

        this.testTexture = null;

        this.blockDropper = new RandomBlockDropper();
    }
    update(time:number){
        const blockTicks = this.blockTickEvent.step(time);
        for(let i = 0; i<blockTicks; i++){
            this.blockTick();
        }

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
        if(this.mouseHighlightedCell){
            const mouseBlock = this.grid.getItem(this.mouseHighlightedCell.x, this.mouseHighlightedCell.y);
            this.blockInfo?.parseInfo(mouseBlock);
        }else{
            this.blockInfo?.noInfo();
        }
    }
    getFurthestEdge(pt:Point){
        /*
        const furthestEdge = this.grid.gridRect.furthestCornerOrthogonalDistance(pt);
        const vec = furthestEdge.vector;
        vec.norm(); vec.multi(40);
        const rectWidth = 100; const rectHeight = 100;
        const rx = vec.x > 0 ? vec.x + pt.x : vec.x + pt.x - rectWidth; 
        const rv = vec.y > 0 ? vec.y + pt.y : vec.y + pt.y - rectHeight;
        //const mp = pt.addVector(vec);
        const rect = new VirtRect(rx, rv, rectWidth, 100);
        this.testRect = rect;
        //console.log(furthestEdge);
        */
    }
    mouseMove(e:React.MouseEvent<HTMLCanvasElement>, pos: Point){
        //console.log(pos);
        //this.getFurthestEdge(pos);
        this.mouseHighlightedCell = this.grid.getGridMouseCoordinates(pos);
        //console.log(this.mouseHighlightedCell);
        this.testRect = this.grid.gridRect.smartMouseRectInside(pos, 50, 30, 30);
        //console.log(this.testRect);
    }
    keyDown(e:KeyboardEvent, key:string){
        switch(key){
            case 'a':
                this.blockMoveLeft();
                break;
            case 'd':
                this.blockMoveRight();
                break;
        }
        if(key === 'q'){
            console.log(this.grid);
        }
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
    addNewBlock(x:number, y:number):SolidBlock | null{
        
        if(!this.grid.getItem(x, y).isSolid){
            //aconst newSolid = this.blockDropper.sedimentBlock(); 
            // drops sediment only
            const newSolid = this.blockDropper.randomBlock();
            //const newSolid = new SolidBlock(x, y);
            //newSolid.newCoordinates();
            this.grid.setGrid(x, y, newSolid);
            this.solidBlocks.push(newSolid);
            //console.log('add block');
            return newSolid;
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
        this.grid.drawBackground(cr);
        //draw blocks
        for(const block of this.solidBlocks){
            const position = this.gridPositions.getItem(block.x, block.y);
            //cr.translate(position.x, position.y);
            //cr.scale(this.grid.gridSize, this.grid.gridSize);
            block.draw(cr, this.grid.gridSize, position);
            //cr.resetTransform();
        }
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

class TimedEvent{
    currentTime: number;
    interval: number;
    constructor(interval:number){
        this.interval = interval;
        this.currentTime = 0;
    }

    // number of times triggered
    step(elapsedTime:number):number{
        this.currentTime += elapsedTime;
        const triggers = Math.floor(this.currentTime/this.interval);
        if(triggers > 0) this.currentTime -= triggers*this.interval;
        return triggers;

    }
}

//const colours = {};
//export { BlockElement };

