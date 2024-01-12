import { Point } from "../geometry/geometry";
import { DrawGrid2D } from "../geometry/grid";
import { Probabilities, randomArrayElement } from "../math/Random";
import { BlockElement, BlockId, DirtBlock, DroppingBlock, 
    LiquidBlock, SedimentBlock, 
    StoneBlock, WoodBlock, 
    blockTextureFromId, 
    generateBlockFromId } from "./blocks";
import { BlockPosition, allBlockShapes } from "./blockshapes";

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
    canRotateClockwise(grid: DrawGrid2D<BlockElement>){
        return this.checkNewSpaceFree(grid, this.x+this.relativeY, this.y-this.relativeX);
    }
    canRotateAntiClockwise(grid: DrawGrid2D<BlockElement>){
        return this.checkNewSpaceFree(grid, this.x-this.relativeY, this.y+this.relativeX);
    }
    rotateClockwise(grid: DrawGrid2D<BlockElement>):boolean{
        if(!this.relativeX && !this.relativeY) return true;
        //if(this.canRotateClockwise(grid)){
            const tmpX = this.relativeX;
            this.relativeX = this.relativeY
            this.relativeY = -tmpX;
            return true;
        //}
        //return false;
    }
    rotateAntiClockwise(grid: DrawGrid2D<BlockElement>){
        if(!this.relativeX && !this.relativeY) return true;
        //if(this.canRotateAntiClockwise(grid)){
            const tmpX = this.relativeX;
            this.relativeX = -this.relativeY
            this.relativeY = tmpX;
            return true;
        //}
        //return false;
    }
    getX(){
        return this.x+this.relativeX;
    }
    getY(){
        return this.y+this.relativeY;
    }
    checkNewSpaceFree(grid: DrawGrid2D<BlockElement>, nx:number, ny:number):boolean{
        if(ny < 0 && grid.isInX(nx)) return true;
        if(!grid.isInGrid(nx, ny)) return false;
        return grid.getItem(nx, ny).getEmpty();
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
    rotateClockwise(grid: DrawGrid2D<BlockElement>): boolean {
        let canRotate = true;
        for(const block of this.relativeBlocks){
            if(!block.canRotateClockwise(grid)){
                canRotate = false;
                break;
            };
        }
        if(!canRotate) return false;
        for(const block of this.relativeBlocks){
            block.rotateClockwise(grid);
        }
        return true;
    }
    rotateAntiClockwise(grid: DrawGrid2D<BlockElement>): boolean {
        let canRotate = true;
        for(const block of this.relativeBlocks){
            if(!block.canRotateAntiClockwise(grid)){
                canRotate = false;
                break;
            };
        }
        if(!canRotate) return false;
        for(const block of this.relativeBlocks){
            block.rotateAntiClockwise(grid);
        }
        return true;
    }
    checkSpaceFree(grid: DrawGrid2D<BlockElement>, rx:number, ry:number):boolean{
        let spaceFree = true;
        for(const block of this.relativeBlocks){
            if(!block.checkSpaceFree(grid, rx, ry)){
                //console.log('?')
                spaceFree = false;
                break;
            }
        }
        if(!spaceFree) return spaceFree;
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

/*
const controlledBlockTestArr = [
    [new ControlledBlock(0, BlockId.StoneBlock, 1, 0)]
]

const blockProbabilities = new Map<BlockId, number>();
blockProbabilities.set(BlockId.StoneBlock, 0.5);
blockProbabilities.set(BlockId.WoodBlock, 0.5);
*/

/*
//export function generateRandomBlocks(probabilities:BlockProbabilities){
export function generateRandomBlocks(x:number, nShape:number):ControlledBlockChain{
    //todo
    //randomArrayElement(blockShapes1)
    const shapePool = allBlockShapes[nShape];
    const shape = randomArrayElement(blockShapes1);
    const relativeBlocks = shape?.map((s:BlockPosition) => {
        return new ControlledBlock(x, getRandomBlockType(), s.x, s.y)
    });
    return new ControlledBlockChain(x, getRandomBlockType(), relativeBlocks);
}

export function getRandomBlockType():BlockId{
    let cr = 0;
    const r = Math.random();
    const blockId: BlockId | null = [...blockProbabilities.entries()].reduce(
        (bid: BlockId | null, [id, prob]) => {
        if(bid !== null) return bid;
        cr += prob;
        if(r < cr){
            bid = id;
        }
        return bid;
    }, null);
    return blockId === null ? 0 : blockId;
}*/

export function generateRandomBlock():DroppingBlock{
    const blockId = randomArrayElement(DroppingBlockIds);
    if(blockId) return generateBlockFromId(blockId);
    return new StoneBlock();
}

const DroppingBlockIds = [
    BlockId.StoneBlock,
    BlockId.DirtBlock,
    BlockId.WoodBlock,
    //BlockId.SedimentBlock,
    //BlockId.LiquidBlock
];

export class RandomBlockGenerator{
    shapeProbabilities: Probabilities<number>;
    blockProbabilities: Probabilities<BlockId>;
    constructor(){
        this.shapeProbabilities = new Probabilities<number>();
        this.blockProbabilities = new Probabilities<BlockId>();
    }
    addShapeProbability(shapeN:number, prob:number, fromShapeN:number|null=null){
        if(!this.shapeProbabilities.has(shapeN)){
            this.shapeProbabilities.addProbability(shapeN);
        }
        this.shapeProbabilities.changeProbability(shapeN, prob, fromShapeN);
    }
    addBlockProbability(blockId:number, prob:number, fromBlockId:number|null=null){
        if(!this.blockProbabilities.has(blockId)){
            this.blockProbabilities.addProbability(blockId);
        }
        this.blockProbabilities.changeProbability(blockId, prob, fromBlockId);
    }
    randomBlockType():BlockId{
        const type = this.blockProbabilities.roll();
        if(!type) return BlockId.StoneBlock;
        return type;
    }
    randomShape(){
        const nShape = this.shapeProbabilities.roll();
        if(!nShape) return randomArrayElement(allBlockShapes[0]);
        return randomArrayElement(allBlockShapes[nShape]);
    }

    generateRandomBlocks(x:number):ControlledBlockChain{
        const shape = this.randomShape();
        //console.log(this.shapeProbabilities);
        //console.log(shape);
        const relativeBlocks = shape?.map((s:BlockPosition) => {
            return new ControlledBlock(x, this.randomBlockType(), s.x, s.y)
        });
        return new ControlledBlockChain(x, this.randomBlockType(), relativeBlocks);
    }

    getProbabilities(){

    }
}