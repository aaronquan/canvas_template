import { Point } from "../geometry/geometry";
import { DrawGrid2D } from "../geometry/grid";
import { randomArrayElement } from "../math/Random";
import { BlockElement, BlockId, DirtBlock, DroppingBlock, 
    LiquidBlock, SedimentBlock, 
    StoneBlock, WoodBlock, 
    blockTextureFromId, 
    generateBlockFromId } from "./blocks";

//focus block and has other blocks around
//allows rotation
class DroppingBlockChain extends DroppingBlock{
    chain: BlockElement[];
    constructor(x?:number, y?:number){
        super(x, y);
        this.chain = [];
    }
}

export class ControlledBlock{
    id:BlockId;
    x: number; y:number;
    relativeX: number;
    relativeY: number;
    constructor(x: number, bId:BlockId, rx: number=0, ry: number=0){
        this.x = x;
        this.y = -2;
        this.id = bId;
        this.relativeX = rx;
        this.relativeY = ry;
    }
    rotateClockwise(){
        const tmpX = this.relativeX;
        this.relativeX = this.relativeY;
        this.relativeY = -tmpX;
    }
    rotateAntiClockwise(){
        const tmpX = this.relativeX;
        this.relativeX = -this.relativeY;
        this.relativeY = tmpX;
    }
    getX(){
        return this.x+this.relativeX;
    }
    getY(){
        return this.y+this.relativeY;
    }
    checkSpaceFree(grid: DrawGrid2D<BlockElement>, rx:number, ry:number):boolean{
        const x = this.getX()+rx; const y = this.getY()+ry;
        if(y < 0 && grid.isInX(x)) return true;
        if(!grid.isInGrid(x, y)) return false;
        return grid.getItem(x, y).getEmpty();
    }
    move(grid: DrawGrid2D<BlockElement>, x:number, y:number):boolean{
        if(this.checkSpaceFree(grid, x, y)){
            this.x += x;
            this.y += y;
            return true;
        }
        return false;
    }
    update(grid: DrawGrid2D<BlockElement>):boolean{
        return this.move(grid, 0, 1);
        //this.y += 1;
    }
    checkUnderIsBlock(grid:DrawGrid2D<BlockElement>):boolean{
        if(this.getY() < 0) return true;
        return this.checkSpaceFree(grid, 0, 1);
    }
    getBlock():BlockElement{
        const block = generateBlockFromId(this.id);
        block.newCoordinates(this.getX(), this.getY());
        return block;
    }
    getBlocks():BlockElement[]{
        return [this.getBlock()];
    }
    draw(cr:CanvasRenderingContext2D, grid:DrawGrid2D<BlockElement>){
        cr.fillStyle = blockTextureFromId(this.id);
        const pos = grid.getGridPosition(this.getX(), this.getY());
        const tr = cr.getTransform()
        cr.translate(pos.x, pos.y)
        cr.fillRect(0, 0, grid.gridSize, grid.gridSize);
        //const position = this.grid.getGridPosition(this.controlledBlock.x, this.controlledBlock.y);
        cr.strokeStyle = 'green';
        cr.strokeRect(0, 0, grid.gridSize, grid.gridSize);

        cr.setTransform(tr);
    }
}

export class ControlledBlockChain extends ControlledBlock{
    relativeBlocks: ControlledBlock[];
    constructor(x: number, bId:BlockId, relativeBlocks:ControlledBlock[]=[]){
        super(x, bId);
        this.relativeBlocks = relativeBlocks;
        for(const block of this.relativeBlocks){
            block.x = this.x; block.y = this.y;
        }
    }
    rotateClockwise(): void {
        for(const block of this.relativeBlocks) block.rotateClockwise();
    }
    rotateAntiClockwise(): void {
        for(const block of this.relativeBlocks) block.rotateAntiClockwise();
    }
    checkSpaceFree(grid: DrawGrid2D<BlockElement>, rx:number, ry:number):boolean{
        let boo = true;
        for(const block of this.relativeBlocks){
            if(!block.checkSpaceFree(grid, rx, ry)){
                //console.log('?')
                boo = false;
                break;
            }
        }
        if(!boo) return boo;
        return super.checkSpaceFree(grid, rx, ry);
    }
    move(grid: DrawGrid2D<BlockElement>, x:number, y:number):boolean{
        if(this.checkSpaceFree(grid, x, y)){
            for(const block of this.relativeBlocks){
                block.x += x;
                block.y += y;
            }
            this.x += x;
            this.y += y;
            return true;
        }
        return false;
    }
    update(grid: DrawGrid2D<BlockElement>):boolean{
        return this.move(grid, 0, 1);
        //this.y += 1;
    }
    /*
    checkUnderIsBlock(grid:DrawGrid2D<BlockElement>):boolean{
        return this.checkSpaceFree(grid, 0, 1);
    }*/
    getBlocks():BlockElement[]{
        const blocks = [];
        blocks.push(this.getBlock());
        for(const block of this.relativeBlocks){
            blocks.push(block.getBlock());
        }
        return blocks;
    }
    addRelative(){

    }
    draw(cr:CanvasRenderingContext2D, grid:DrawGrid2D<BlockElement>){
        super.draw(cr, grid);
        for(const block of this.relativeBlocks){
            block.draw(cr, grid);
            //console.log(block);
        }
    }
}

const controlledBlockTestArr = [
    [new ControlledBlock(0, BlockId.StoneBlock, 1, 0)]
]


const DroppingBlockIds = [
    BlockId.StoneBlock,
    BlockId.DirtBlock,
    BlockId.WoodBlock,
    //BlockId.SedimentBlock,
    //BlockId.LiquidBlock
];

export class RandomBlockDropper{
    constructor(){

    }
    sedimentBlock():SedimentBlock{
        return new SedimentBlock();
    }
    randomBlock():DroppingBlock{
        const blockId = randomArrayElement(DroppingBlockIds);
        if(blockId) return generateBlockFromId(blockId);
        return new StoneBlock();
        /*
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
        */
    }
}