import { Point } from "../geometry/geometry";
import { Coordinate2DType, DrawGrid2D, VirtualGrid2D } from "../geometry/grid";
import { VirtRect } from "../geometry/shapes";

class BlockElement implements Coordinate2DType{
    x: number;
    y: number;
    isSolid: boolean;
    //isDropping: boolean;
    constructor(x?:number, y?:number){
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.isSolid = false;
    }
    newCoordinates(x:number, y:number){
        this.x = x;
        this.y = y;
    }
    update(_grid:DrawGrid2D<BlockElement>){
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillRect(0, 0, 1, 1);
    }
}

//blocks that drop (user can control)
class DroppingBlock extends BlockElement{
    isDropping: boolean; 
    constructor(x?:number, y?:number){
        super(x, y);
        this.isDropping = true;
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
    update(grid:DrawGrid2D<BlockElement>){
        if(this.isDropping){
            const yd1 = this.y + 1;
            if(grid.isInGrid(this.x, yd1)){
                //dropping
                const underBlock = grid.getItem(this.x, yd1);
                if(!underBlock.isSolid){
                    grid.swapGrid(this.x, this.y, this.x, yd1);
                }else{
                    this.isDropping = false;
                }
            }else{
                this.isDropping = false;
            }
        }
    }
}

export class SolidBlock extends DroppingBlock{
    isFalling: boolean;
    constructor(x?:number, y?:number){
        super(x, y);
        this.isSolid = true;
        this.isFalling = true; 
    }
    update(grid:DrawGrid2D<BlockElement>){
        super.update(grid);
        /*
        if(this.isFalling){
            const yd1 = this.y + 1;
            if(grid.isInGrid(this.x, yd1)){
                //falling
                const underBlock = grid.getItem(this.x, yd1);
                if(!underBlock.isSolid){
                    grid.swapGrid(this.x, this.y, this.x, yd1);
                }else{
                    this.isFalling = false;
                }
            }else{
                this.isFalling = false;
        }*/
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'blue';
        cr.fillRect(0, 0, 1, 1);
    }
}

//focus block and has other blocks around
//allows rotation
class DroppingBlockChain extends DroppingBlock{
    chain: BlockElement[];
    constructor(x?:number, y?:number){
        super(x, y);
        this.chain = [];
    }
}


export class GameGrid{
    grid: DrawGrid2D<BlockElement>;
    gridPositions: VirtualGrid2D<Point>;

    solidBlocks: SolidBlock[];

    controlledBlock: SolidBlock | null;

    mouseHighlightedCell: Point | null;

    testRect: VirtRect | null;

    blockSpawnEvent: TimedEvent;
    blockTickEvent: TimedEvent;

    blockInfo: null; // todo next?

    constructor(){
        console.log('init game');
        this.grid = new DrawGrid2D<BlockElement>(BlockElement, new Point(50, 50), 10, 20, 40);
        this.gridPositions = this.grid.getGridPositionsMap();
        this.solidBlocks = [];

        this.controlledBlock = null;

        this.mouseHighlightedCell = null;
        this.blockSpawnEvent = new TimedEvent(2000);
        this.blockTickEvent = new TimedEvent(400);

        this.testRect = null;

        this.blockInfo = null;
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
            }
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
        //console.log(this.grid.getItem(x, y));
        if(!this.grid.getItem(x, y).isSolid){
            const newSolid = new SolidBlock(x, y);
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
            cr.translate(position.x, position.y);
            cr.scale(this.grid.gridSize, this.grid.gridSize);
            block.draw(cr);
            cr.resetTransform();
        }
        if(this.controlledBlock){
            const position = this.gridPositions.getItem(this.controlledBlock.x, this.controlledBlock.y);
            cr.strokeStyle = 'green';
            cr.strokeRect(position.x, position.y, this.grid.gridSize, this.grid.gridSize);
            cr.resetTransform();
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
            cr.resetTransform();
        }
        if(this.testRect){
            this.testRect.draw(cr);
        }
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

const colours = {};
