import { Point } from "../geometry/geometry";
import { VirtRect } from "../geometry/shapes";
import { DrawText } from "../graphics/text";
import { ProbabilityItem } from "../math/Random";
import { BlockElement, BlockId, DroppingBlock, StoneBlock, blockTypeStrings, generateBlockFromId } from "./blocks";


type PauseMenuModifications = {
    unpause? : boolean;
}

export class InterfaceBox{
    box:VirtRect;
    static textSize = 20;
    constructor(pt:Point, width:number, height:number){
        this.box = new VirtRect(pt.x, pt.y, width, height);
    }
    moveTo(pos: Point){
        this.box.moveTo(pos);
    }
    draw(cr:CanvasRenderingContext2D):void{
        this.box.fill(cr);
    }
}

export class PauseMenu{
    box: VirtRect;
    closeBox: VirtRect;
    closeBoxColour: string;

    //modifications: PauseMenuModifications
    //screenWidth: number;
    //screenHeight;
    constructor(){
        this.box = new VirtRect(100, 100, 200, 200);
        this.closeBox = new VirtRect(180, 150, 40, 30);
        this.closeBoxColour = 'white';
    }
    moveTo(pos: Point){
        this.box.moveTo(pos);
        this.closeBox.moveTo(pos)
    }
    mouseMove(pos: Point){
        if(this.closeBox.hitPoint(pos)){
            this.closeBoxColour = '#dddddd';
        }else{
            this.closeBoxColour = 'white';
        }
    }
    mouseDown(pos: Point):PauseMenuModifications | null{
        if(this.closeBox.hitPoint(pos)){
            return {unpause: true};
        }
        return null;
    }
    draw(cr:CanvasRenderingContext2D, screenWidth:number, screenHeight:number):void{
        cr.fillStyle = '#00000044';
        cr.fillRect(0, 0, screenWidth, screenHeight);
        cr.fillStyle = 'grey';
        this.box.fill(cr);
        cr.fillStyle = this.closeBoxColour;
        this.closeBox.fill(cr);
    }
}

export class BlockInfo{
    box:VirtRect;
    coordinate:DrawText;

    typeInfo:DrawText;
    isDroppingInfo:DrawText;
    isEmptyInfo:DrawText;
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
        this.isEmptyInfo = new DrawText('', new Point(pos.x, pos.y+75), 15);
    }
    parseInfo(b: BlockElement){
        const info = b.getInfo();
        const p = new Point(info.x, info.y);
        this.coordinate.text = p.toString();
        const typeString:string = blockTypeStrings[info.type as BlockId];
        this.typeInfo.text = 'Type: ' + typeString;
        this.isDroppingInfo.text = 'Dropping: ' + info.isDropping;
        this.isEmptyInfo.text = 'Empty: ' + info.isEmpty;
    }
    noInfo(){
        this.coordinate.text = '';
        this.typeInfo.text = '';
        this.isDroppingInfo.text = '';
        this.isEmptyInfo.text = '';
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'black';
        this.box.fill(cr);
        this.box.draw(cr);
        this.coordinate.draw(cr);
        this.typeInfo.draw(cr);
        this.isDroppingInfo.draw(cr);
        this.isEmptyInfo.draw(cr);
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
        this.blocks = blocks.map((id) => generateBlockFromId(id));
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

export class ShapeProbabilityInterface extends InterfaceBox{
    data: ProbabilityItem<number>[];
    texts: DrawText[];
    constructor(pt:Point, width:number, height:number){
        super(pt, width, height);
        this.data = [];

        this.texts = [];
    }
    setData(probs: ProbabilityItem<number>[]){
        let textY = this.box.top + InterfaceBox.textSize;
        this.texts = [];
        for(const prob of probs){
            this.texts.push(new DrawText(prob.item+': '+prob.probability.toFixed(2), 
            new Point(this.box.left, textY), InterfaceBox.textSize));
            textY += InterfaceBox.textSize+5;
        }
        this.data = probs;
    }
    moveTo(pt:Point){
        super.moveTo(pt);
        let textY = this.box.top + InterfaceBox.textSize;
        for(const text of this.texts){
            text.textPoint = new Point(this.box.left, textY);
            textY += InterfaceBox.textSize+5;
        }
    }

    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'black';
        super.draw(cr);
        for(const text of this.texts){
            text.draw(cr);
        }
    }
}

export class BlockProbabilityInterface extends InterfaceBox{
    data: ProbabilityItem<BlockId>[];
    texts: DrawText[];
    static textSize = 20;
    constructor(pt:Point, width:number, height:number){
        super(pt, width, height);
        this.data = [];

        this.texts = [];
    }
    setData(probs: ProbabilityItem<BlockId>[]){
        let textY = this.box.top + InterfaceBox.textSize;
        this.texts = [];
        for(const prob of probs){
            const newText = new DrawText(blockTypeStrings[prob.item]+': '+prob.probability.toFixed(2), 
            new Point(this.box.left, textY), InterfaceBox.textSize);
            this.texts.push(newText);
            textY += InterfaceBox.textSize+5;
        }
        this.data = probs;
    }
    moveTo(pt:Point){
        super.moveTo(pt);
        let textY = this.box.top + BlockProbabilityInterface.textSize;
        for(const text of this.texts){
            text.textPoint = new Point(this.box.left, textY);
            textY += InterfaceBox.textSize+5;
        }
    }

    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'black';
        super.draw(cr);
        for(const text of this.texts){
            text.draw(cr);
        }
    }
}