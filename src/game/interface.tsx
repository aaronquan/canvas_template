import { Point } from "../geometry/geometry";
import { VirtRect } from "../geometry/shapes";
import { DrawText } from "../graphics/text";
import { BlockElement, BlockId, DroppingBlock, StoneBlock, blockTypeStrings, generateDroppingBlockFromId } from "./blocks";


export class BlockInfo{
    box:VirtRect;
    coordinate:DrawText;

    typeInfo:DrawText;
    isDroppingInfo:DrawText;
    constructor(pos:Point){
        this.box = new VirtRect(pos.x, pos.y, 200, 200);
        this.moveTo(pos);
        /*
        this.coordinate = new DrawText('', new Point(pos.x, pos.y+15), 15);
        this.typeInfo = new DrawText('', new Point(pos.x, pos.y+35), 15);
        this.isDroppingInfo = new DrawText('', new Point(pos.x, pos.y+55), 15);
        */
    }
    moveTo(pos: Point){
        this.box = new VirtRect(pos.x, pos.y, 200, 200);
        this.coordinate = new DrawText('', new Point(pos.x, pos.y+15), 15);
        this.typeInfo = new DrawText('', new Point(pos.x, pos.y+35), 15);
        this.isDroppingInfo = new DrawText('', new Point(pos.x, pos.y+55), 15);
    }
    parseInfo(b: BlockElement){
        const info = b.getInfo();
        const p = new Point(info.x, info.y);
        this.coordinate.text = p.toString();
        const typeString:string = blockTypeStrings[info.type as BlockId];
        this.typeInfo.text = 'Type: ' + typeString;
        this.isDroppingInfo.text = 'Dropping: ' + info.isDropping;
    }
    noInfo(){
        this.coordinate.text = '';
        this.typeInfo.text = '';
        this.isDroppingInfo.text = '';
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'black';
        this.box.fill(cr);
        this.box.draw(cr);
        this.coordinate.draw(cr);
        this.typeInfo.draw(cr);
        this.isDroppingInfo.draw(cr);
    }
}

export class DropBlockPickerInterface{
    box:VirtRect;
    blocks: DroppingBlock[];
    picked: BlockId;
    pickedIndex: number
    blockSize: number;
    constructor(pos:Point, blocks: BlockId[]){
        this.blockSize = 50;
        this.box = new VirtRect(pos.x, pos.y, blocks.length*this.blockSize, this.blockSize);
        this.blocks = blocks.map((id) => generateDroppingBlockFromId(id));
        this.pickedIndex = 0;
        this.picked = blocks.length > 0 ? blocks[0] : BlockId.StoneBlock;
    }
    moveTo(pt:Point){
        this.box.moveTo(pt);
    }
    isInside(pos: Point){
        return this.box.hitPoint(pos);
    }
    mouseMove(pos: Point){

    }
    mouseDown(pos: Point){
        if(this.isInside(pos)){
            const relativeX = pos.x - this.box.left;
            const x = Math.floor(relativeX / this.blockSize);
            this.pickedIndex = x;
            this.picked = this.blocks[x].type;
            //console.log(this.picked);
        }
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'black';
        this.box.fill(cr);
        this.box.draw(cr);
        for(let i = 0; i<this.blocks.length; ++i){
            const x = this.box.left+i*this.blockSize;
            this.blocks[i].draw(cr, this.blockSize, new Point(x, this.box.top));
        }
        if(this.blocks.length > 0){
            cr.strokeStyle = 'green';
            cr.lineWidth = 2;
            cr.strokeRect(this.box.left+this.pickedIndex*this.blockSize, this.box.top, 
                this.blockSize, this.blockSize);
        }
    }
}