import { Point } from "../geometry/geometry";
import { VirtRect } from "../geometry/shapes";
import { DrawText, TextLines } from "../graphics/text";
import { ProbabilityItem } from "../math/Random";
import { RandomBlockGenerator } from "./blockchain";
import { BlockElement, BlockId, DroppingBlock, StoneBlock, blockSize, blockTypeStrings, generateBlockFromId } from "./blocks";
import { BlockComboEngine } from "./combo";
import { BlockCombos } from "./customCombos";


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
    isInside(pos:Point):boolean{
        return this.box.hitPoint(pos);
    }
    draw(cr:CanvasRenderingContext2D, screenWidth?:number, screenHeight?:number):void{
        this.box.fill(cr);
    }
}

export class PauseMenu{
    box: VirtRect;
    closeBox: VirtRect;
    closeBoxColour: string;
    paused: DrawText;

    //modifications: PauseMenuModifications
    //screenWidth: number;
    //screenHeight;
    constructor(){
        this.box = new VirtRect(100, 100, 200, 200);
        this.closeBox = new VirtRect(180, 150, 40, 30);
        this.closeBoxColour = 'white';
        this.paused = new DrawText('Paused', new Point(0, 0), 30);
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

        if(screenWidth && screenHeight) this.paused.textPoint = new Point(screenWidth/2, screenHeight/2);
        this.paused.drawCentre(cr);
    }
}

export class BlockInfo{
    box:VirtRect;
    coordinate:DrawText;

    typeInfo:DrawText;
    isDroppingInfo:DrawText;
    isEmptyInfo:DrawText;
    static size : number = 16;
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
        this.coordinate = new DrawText('', new Point(pos.x, pos.y+15), BlockInfo.size);
        this.typeInfo = new DrawText('', new Point(pos.x, pos.y+35), BlockInfo.size);
        this.isDroppingInfo = new DrawText('', new Point(pos.x, pos.y+55), BlockInfo.size);
        this.isEmptyInfo = new DrawText('', new Point(pos.x, pos.y+75), BlockInfo.size);
    }
    parseInfo(b: BlockElement){
        const info = b.getInfo();
        const p = new Point(info.x, info.y);
        this.coordinate.text = p.toString();
        const typeString:string = blockTypeStrings[info.type as BlockId];
        this.typeInfo.text = 'Block Type: ' + (typeString === 'Default' ? 'Nothing!' : typeString);
        this.isDroppingInfo.text = 'Floats: ' + info.isFloating;
        this.isEmptyInfo.text = 'Sandy: ' + info.isSand;
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
        //this.coordinate.draw(cr);
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

export type ReturnDisplayComboBlock = {
    block?: BlockCombos.CBlock;
}

export type ChangeBlockEffect = {

}

export class DisplayCombo{
    combo: BlockCombos.BlockComboBlocks | null;
    x: number; y:number;
    rect: VirtRect;
    size: number;
    constructor(combo:BlockCombos.BlockComboBlocks | null, x:number, y:number, size:number){
        this.combo = combo;
        this.x = x;
        this.y = y;
        this.size = size;
        this.rect = new VirtRect(x, y, size*4, size*4);
    }
    randomise(rbg:RandomBlockGenerator){
        //this.combo?.blocks.
        console.log('randomise');
        if(this.combo){
            for(const block of this.combo.blocks)
                block.id = rbg.randomBlockType();
        }
    }
    isInside(pos:Point){
        return this.rect.hitPoint(pos);
    }
    mouseOver(pos:Point, effect?:ChangeBlockEffect){
        if(this.isInside(pos)){
            const block = this.getComboBlock(pos);
        }
    }
    mouseDown(pos:Point){
        if(this.isInside(pos)){
            const block = this.getComboBlock(pos);
        }
    }
    getComboBlock(pos:Point): {block: BlockCombos.CBlock | null, index?:number}{
        if(this.combo){
            const cx = this.rect.cx-((this.combo.range.maxX+1)/2)*this.size;
            const cy = this.rect.cy-((this.combo.range.maxY+1)/2)*this.size;
            const relativePt = new Point(pos.x - cx, pos.y - cy);
            const x = Math.floor(relativePt.x / this.size);
            const y = Math.floor(relativePt.y / this.size);
            let n = undefined;
            const found:BlockCombos.CBlock | null = this.combo.blocks.reduce
            ((f:BlockCombos.CBlock | null, block:BlockCombos.CBlock, i:number) => {
                if(block.x === x && block.y === y){
                    n = i;
                    return block;
                }
                return f;
            }, null)

            return {block: found, index: n};
        }
        return {block: null, index: undefined};
    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillStyle = 'grey';
        this.rect.fill(cr);
        if(this.combo){
            const x = this.rect.cx-((this.combo.range.maxX+1)/2)*this.size;
            const y = this.rect.cy-((this.combo.range.maxY+1)/2)*this.size;
            BlockCombos.drawCombo(cr, this.combo.blocks, this.size, x, y);
        }
    }
}

export type ComboEngineClickReturn = {
    pickComboInterface?: boolean
}

export class ComboEngineInterface extends InterfaceBox{
    newCombos: boolean;
    engine: BlockComboEngine;
    title: DrawText;

    pickComboButton: VirtRect;
    pickComboText: DrawText;

    bColour: string;
    tColour: string;

    combos: DisplayCombo[];
    comboIndex: number;

    nonTicks: number;

    mousedItem: number | null;

    constructor(bce: BlockComboEngine){
        super(new Point(), 200, 350);
        this.engine = bce;
        this.title = new DrawText('Combos!', new Point(), 18);
        this.newCombos = true;
        this.pickComboButton = new VirtRect(0, 0, 180, 30);
        this.pickComboText = new DrawText('PICK COMBOS!!!', new Point(), 20, undefined,
        '#cc867d');

        this.bColour = '#c0d0a5';
        this.tColour = '#cc867d';

        //16*4 = 64 * 3 = 192
        //64 * 
        //start at 20
        this.combos = [];
        this.comboIndex = 0;
        let cy = this.box.top+44;
        const size = 24;
        for(let j=0; j<3; j++){
            let cx = this.box.left+3;
            for(let i=0; i<2; i++){
                this.combos.push(new DisplayCombo(null, cx, cy, size));
                cx += size*4+1;
            }
            cy += size*4+4;
        }
        //console.log(this.combos);

        this.mousedItem = null;

    }
    addCombo(blockCombo:BlockCombos.BlockComboBlocks){
        if(this.comboIndex < this.combos.length){
            this.combos[this.comboIndex].combo = blockCombo;
        }
        this.comboIndex++;
        if(this.comboIndex >= this.combos.length) this.comboIndex = 0;
    }
    moveTo(pt:Point){
        this.box.moveTo(pt);
        this.title.textPoint = new Point(pt.x, pt.y+18);
        this.pickComboButton.moveTo(new Point(pt.x+10, pt.y+5));
        this.pickComboText.textPoint = new Point(pt.x+10+
            (this.pickComboButton.width/2), 
            pt.y+(this.pickComboButton.height/2));
        
        //console.log(this.combos);d
        let cy = pt.y+44;
        const size = 24;
        for(let j=0; j<3; j++){
            let cx = pt.x+3;
            for(let i=0; i<2; i++){
                if((i)+(j*2) < this.combos.length){
                    this.combos[(i)+(j*2)].rect.moveTo(new Point(cx, cy));
                }
                //this.combos[i*j].x = cx;
                //this.combos[i*j].y = cy;
                cx += size*4+1;
            }
            cy += size*4+4;
        }
    }
    mouseOver(pos:Point)
    :{comboId: number|null, block:BlockCombos.CBlock | null, blockIndex?: number}{
        const mousedItem:number|null = 
        this.combos.reduce((i:number|null, c, id) => {
            if(c.isInside(pos)) return id;
            return i;
        }, null);
        let block = null
        if(mousedItem !== null){
            const b = this.combos[mousedItem].getComboBlock(pos);
            block = b;
        }
        //console.log(mousedItem);
        this.mousedItem = mousedItem;
        //console.log(mousedItem);
        if (block) return {comboId: mousedItem, block: block.block, blockIndex: block.index};

        return {comboId: mousedItem, block: null, blockIndex: undefined}
    }
    mouseUp(){

    }
    isClicked(pos:Point):ComboEngineClickReturn{
        if(this.box.hitPoint(pos)){
            const relPoint = new Point(pos.x-this.box.left, pos.y-this.box.top);
            if(this.newCombos && this.pickComboButton.hitPoint(pos)){
                return {pickComboInterface : true}
            }
            for(const combo of this.combos){
                combo.mouseDown(pos);
            }
        }
        return {};
    }
    flicker(){
        const swp = this.bColour;
        this.bColour = this.tColour;
        this.tColour = swp;
        this.pickComboText.colour = this.tColour;
    }

    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'black';
        super.draw(cr);

        //this.engine.drawCombos(cr, this.box.left, this.box.top);
        
        if(!this.newCombos){
            this.title.draw(cr);
        }else{
            cr.fillStyle = this.bColour;
            this.pickComboButton.fill(cr);
            cr.fillStyle = this.tColour;
            this.pickComboText.drawCentre(cr);
        }
        for(const combo of this.combos){
            combo.draw(cr);
        }
    }
}

export class ShapeProbabilityInterface extends InterfaceBox{
    data: ProbabilityItem<number>[];
    texts: DrawText[];

    //icons: []
    static textSize = 18;
    constructor(pt:Point, width:number, height:number){
        super(pt, width, height);
        this.data = [];

        this.texts = [];
    }
    setData(probs: ProbabilityItem<number>[]){
        let textY = this.box.top + ShapeProbabilityInterface.textSize;
        this.texts = [];
        this.texts.push(new DrawText('N Shape %', new Point(this.box.left, textY),
        ShapeProbabilityInterface.textSize));
        //this.moveTo(new Point(this.box.left, this.box.top));
        textY += ShapeProbabilityInterface.textSize;
        for(const prob of probs){
            this.texts.push(new DrawText((prob.item+1)+': '+(100*prob.probability).toFixed(0), 
            new Point(this.box.left, textY), ShapeProbabilityInterface.textSize));
            textY += ShapeProbabilityInterface.textSize+5;
        }
        this.data = probs;
    }
    moveTo(pt:Point){
        super.moveTo(pt);
        let textY = this.box.top + ShapeProbabilityInterface.textSize;
        for(const text of this.texts){
            text.textPoint = new Point(this.box.left, textY);
            textY += ShapeProbabilityInterface.textSize+5;
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
    //title: DrawText;
    texts: DrawText[];
    icons: {block: BlockElement, pt:Point}[];
    static textSize = 18;
    constructor(pt:Point, width:number, height:number){
        super(pt, width, height);
        this.data = [];

        this.texts = [];
        this.icons = [];

        //this.title = new DrawText('Block %', new Point(this.box.left, this.box.top+15),
        //ShapeProbabilityInterface.textSize);
    }
    setData(probs: ProbabilityItem<BlockId>[]){
        let textY = this.box.top + InterfaceBox.textSize;
        this.texts = [];
        this.icons = [];
        this.texts.push(new DrawText('Block %', new Point(this.box.left, textY),
        ShapeProbabilityInterface.textSize));
        //this.moveTo(new Point(this.box.left, this.box.top));
        textY += ShapeProbabilityInterface.textSize;
        for(const prob of probs){
            const newText = new DrawText('  : '+(100*prob.probability).toFixed(0), 
            new Point(this.box.left, textY), BlockProbabilityInterface.textSize);
            this.texts.push(newText);
            textY += InterfaceBox.textSize+5;
            const block = generateBlockFromId(prob.item);
            this.icons.push({block: block, pt: new Point()});
        }
        textY = this.box.top + BlockProbabilityInterface.textSize;
        for(const icon of this.icons){
            icon.pt = new Point(this.box.left+2, textY+7);
            textY += BlockProbabilityInterface.textSize+5
        }
        this.data = probs;
    }
    moveTo(pt:Point){
        super.moveTo(pt);
        let textY = this.box.top + BlockProbabilityInterface.textSize;
        for(const text of this.texts){
            text.textPoint = new Point(this.box.left, textY);
            textY += BlockProbabilityInterface.textSize+5;
        }
        textY = this.box.top + BlockProbabilityInterface.textSize;
        for(const icon of this.icons){
            icon.pt = new Point(this.box.left+2, textY+7);
            textY += BlockProbabilityInterface.textSize+5
        }
    }

    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'black';
        super.draw(cr);
        //this.title.draw(cr);
        for(const text of this.texts){
            text.draw(cr);
        }
        for(const icon of this.icons){
            icon.block.draw(cr, BlockProbabilityInterface.textSize+1, icon.pt);
        }
    }
}

export class ComboItemInterface extends InterfaceBox{
    combo: BlockCombos.BlockComboBlocks | null;
    cx: number; cy: number; //values to centre combo
    selected: boolean;
    hoverColour: string;
    selectedColour: string;
    colour: string;
    constructor(pt:Point, combo:BlockCombos.BlockComboBlocks | null=null, width?: number, height?:number){
        super(pt, blockSize*6, blockSize*6);
        this.combo = combo;
        if(combo){
            this.cx = (this.box.width/2) - ((combo.range.maxX+1)*blockSize)/2;
            this.cy = (this.box.height/2) - ((combo.range.maxY+1)*blockSize)/2;
        }
        this.selected = false;

        this.selectedColour = '#c0d0a5';
    }
    select():boolean{
        this.selected = !this.selected;
        return this.selected;
    }
    setCombo(combo:BlockCombos.BlockComboBlocks){
        this.combo = combo;
        this.selected = false;
        if(combo){
            this.cx = (this.box.width/2) - ((combo.range.maxX+1)*blockSize)/2;
            this.cy = (this.box.height/2) - ((combo.range.maxY+1)*blockSize)/2;
        }
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = this.selected ? this.selectedColour : '#cc867d';
        super.draw(cr);
        if(this.combo){
            const tr = cr.getTransform();
            cr.translate(this.box.left, this.box.top);
            BlockCombos.drawCombo(cr, this.combo.blocks, blockSize, this.cx, this.cy);
            cr.setTransform(tr);
        }
    }
}

export type ConfirmComboReturn = {
    combos: BlockCombos.BlockComboBlocks[];
}

export class ComboChooseInterface extends InterfaceBox{
    items:ComboItemInterface[];
    active: boolean;
    headerString: DrawText;
    confirmButton: VirtRect;
    confirmText: DrawText;
    nSelected: number;
    needSelected:number;

    selectedText: DrawText;
    constructor(pt:Point, width:number, height:number){
        super(pt, width, height);
        this.items = [];

        const spacing = blockSize*6;
        const headerSpace = 50;
        const footerSpace = 100;
        const perColumn = 3;
        for(let i = 0; i < perColumn; i++){
            this.items.push(new ComboItemInterface(new Point(i*spacing, headerSpace)));
        }
        for(let i = 0; i < perColumn; i++){
            this.items.push(new ComboItemInterface(new Point(i*spacing, headerSpace+spacing)));
        }
        //this.items = [new ComboItemInterface(new Point())];
        this.active = false;
        //this.box.width = perColumn*spacing;
        //this.box.height = 2*spacing+headerSpace+footerSpace;
        this.box.changeDimensions(perColumn*spacing, 2*spacing+headerSpace+footerSpace)
        this.headerString = new DrawText('Select Combo:', new Point(this.box.width/2, 20), 20, undefined, 'white');
        this.confirmButton = new VirtRect(this.box.width/2 - 100, 2*spacing+headerSpace+40, 200, 40);
        this.confirmText = new DrawText('Confirm', new Point(this.confirmButton.cx, this.confirmButton.cy),
        15, undefined, 'black');
        // '#bbb094'
        
        this.nSelected = 0;
        this.needSelected = 2;

        this.selectedText = new DrawText(this.getSelectedText(), new Point(5, 15), 15);
    }
    changeNeedSelected(n:number){
        this.needSelected = n;
        this.nSelected = 0;
        this.selectedText.text = this.getSelectedText();
    }
    getSelectedText(){
        const toSelect = this.needSelected - this.nSelected;
        if(toSelect >= 0){
            return 'Select '+toSelect.toString()+' combo'+this.nString();
        }
        return 'Deselect '+(-toSelect).toString()+' combo'+this.nString();
    }
    nString():string{
        if(Math.abs(this.needSelected - this.nSelected) > 1){
            return 's';
        }
        return '';
    }
    mouseMove(pos: Point):boolean{
        const relPoint = new Point(pos.x-this.box.left, pos.y-this.box.top);

        return false;
    }
    selectedRequirement(){
        return this.nSelected === this.needSelected;
    }
    isClicked(pos: Point):BlockCombos.BlockComboBlocks[] | null{
        if(this.active){
            if(this.isInside(pos)){
                const relPoint = new Point(pos.x-this.box.left, pos.y-this.box.top);
                this.checkItemClick(relPoint);
                if(this.selectedRequirement() && this.confirmButton.hitPoint(relPoint)){
                    const combos = [];
                    for(const item of this.items){
                        if(item.selected && item.combo) combos.push(item.combo);
                    }
                    this.needSelected = 0;
                    return combos;
                }
            }
            return null;
        }
        return null;
    }
    checkItemClick(relPoint:Point){
       // const relPoint = new Point(pos.x-this.box.left, pos.y-this.box.top);
        for(const item of this.items){
            if(item.combo !== null){
                if(item.isInside(relPoint)){
                    if(item.select()){
                        this.nSelected++;
                    }else{
                        this.nSelected--;
                    }
                    this.selectedText.text = this.getSelectedText();
                }
            }
        }
    }
    centre(w:number, h:number){
        this.box.moveTo(new Point((w/2)-(this.box.width/2), (h/2)-(this.box.height/2)));
    }
    draw(cr:CanvasRenderingContext2D, screenWidth:number, screenHeight:number):void{
        if(this.active){
            cr.fillStyle = '#00000044';
            cr.fillRect(0, 0, screenWidth, screenHeight);
            cr.fillStyle = 'black';
            super.draw(cr);
            cr.strokeStyle = 'white';
            this.box.draw(cr);

            const tr = cr.getTransform();
            cr.translate(this.box.left, this.box.top);

            //draw text
            this.headerString.drawCentre(cr);

            //draw button
            cr.fillStyle = this.selectedRequirement() ? '#c0d0a5' : '#cc867d';
            this.confirmButton.fill(cr);
            this.confirmText.drawCentre(cr);
            this.selectedText.draw(cr);

            // draw items
            for(const item of this.items){
                item.draw(cr);
            }

            cr.setTransform(tr);
        }
    }
}



export class AbilityItem extends InterfaceBox{
    itemId: number;
    overridePt: Point | undefined
    constructor(id:number, pt?:Point,){
        super(new Point(), 50, 50);
        this.itemId = id;
        this.overridePt = undefined;
    }
    moveTo(pt:Point){
        super.moveTo(pt);
    }
    drawItem(cr:CanvasRenderingContext2D, isMini:boolean=true){
        const tr = cr.getTransform();
        if(isMini){
            //cr.translate(-this.box.left, -this.box.right);
            //cr.translate(this.box.left, this.box.right)
            const ox = this.overridePt !== undefined ? this.overridePt.x : this.box.left;
            const oy = this.overridePt !== undefined ? this.overridePt.y : this.box.top;
            const scale = 0.3;
            cr.scale(scale, scale);
            const x = (ox-(this.box.width*scale*0.5))*(1/scale);
            const y = (oy-(this.box.height*scale*0.5))*(1/scale);
            cr.translate(x, y);
        }else{
            cr.translate(this.box.left, this.box.top)
        }
        cr.fillStyle = 'black';
        cr.fillRect(0, 0, this.box.width, this.box.height);
        if(this.itemId == -1){
            const dt = new DrawText('X', new Point(this.box.cx-this.box.left, this.box.cy-this.box.top-10), 
            50, undefined, 'white');
            dt.drawCentre(cr);
        }else{
            const block = generateBlockFromId(this.itemId);
            block.draw(cr, 50, new Point(0, 0));
        }

        cr.setTransform(tr);
    }
}

export class AbilityInterface extends InterfaceBox{
    abilitySlots: AbilityItem[];
    constructor(pt?:Point){
        super(new Point(), 600, 100);
        this.abilitySlots = [new AbilityItem(-1)]
    }
    addAbility(id:number){
        const ability =  new AbilityItem(id);
        this.abilitySlots.push(ability);
        this.moveTo(new Point(this.box.left, this.box.top));
    }
    mouseOver(pt:Point):number | null{
        if(this.box.hitPoint(pt)){
            for(let i = 0; i<this.abilitySlots.length; ++i){
                if(this.abilitySlots[i].isInside(pt)){
                    return i;
                };
            }
            return null;
        }
        return null;
    }
    mouseDown(pt:Point){
        if(this.box.hitPoint(pt)){

        }
    }
    keyDown(){

    }
    moveTo(pt:Point){
        super.moveTo(pt);
        let x = this.box.left;
        for(let i = 0; i<this.abilitySlots.length; ++i){
            this.abilitySlots[i].box.moveTo(new Point(x, pt.y));
            x += this.abilitySlots[i].box.width;
        }
        //console.log(pt);
    }
    drawItems(cr:CanvasRenderingContext2D, miniId: number | undefined){
        //super.draw(cr);
        let i = 0;
        for(const ability of this.abilitySlots){
            //console.log(ability);
            const isMini = i === miniId;
            i++;
            ability.drawItem(cr, isMini);
            const dt = new DrawText(i.toString(), new Point(ability.box.left, ability.box.bottom+20), 
            15, undefined, 'black');
            
            dt.draw(cr);
        }
        
    }
}



export class ShopInterface extends InterfaceBox {
    title:DrawText;
    //items:ShopItem;
    constructor(pt?:Point){
        super(new Point(), 220, 140);
        this.title = new DrawText('SHOP', new Point(), 15, undefined, 'white')
    }
    moveTo(pt:Point){
        super.moveTo(pt);
        this.title.textPoint = new Point(this.box.left+110, this.box.top+10);
    }
    mouseOver(){

    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillStyle = 'black';
        this.box.fill(cr);
        console.log(this.title);
        this.title.drawCentre(cr);
    }
}

export class MouseOverInterface extends InterfaceBox {
    active: boolean;
    texts: TextLines;
    //width: number;
    lock: boolean;

    constructor(){
        super(new Point(), 200, 0);
        this.active = false;
        this.texts = new TextLines(new Point(), 15);
        this.lock = false;
        //new DrawText('', new Point(), 15, undefined, 'white');
        //this.text.maxWidth = this.box.width;
    }
    setLock(){
        this.lock = true;
        setTimeout(() => {
            this.lock = false;
        }, 800);
    }
    setTexts(t:string[]){
        if(!this.lock){
            this.texts.texts = t;
            this.box.height = t.length*this.texts.size+10;
        }
        //this.box.height = t.length*this.texts.size+10;
    }
    mouseMove(pos:Point, screenRect: VirtRect){
        this.box = screenRect.smartMouseRectInside(pos, 50, this.box.width, this.box.height);
        this.texts.textPoint = new Point(this.box.left, this.box.top+15);
    }
    moveTo(pt:Point){
        super.moveTo(pt);
        //for(let i = 0; i<this.texts; i<)
        //this.texts = 
        this.texts.textPoint = new Point(this.box.left, this.box.top)
    }
    draw(cr:CanvasRenderingContext2D){
        if(this.active){
            const wid = this.texts.getMaxWidth(cr)+5;
            this.box.changeDimensions(wid, this.box.height);
            cr.fillStyle = 'black';
            this.box.fill(cr);

            cr.strokeStyle = 'white';
            this.box.draw(cr);
            this.texts.draw(cr);
        }
    }

}

/*
export namespace CustomInterface{
    export type VerticalTripleBox = {
        width: number;
        height: number;
        title: string;
        boxes: Box[];
    }

    export type Box = {
        width:number; height:number;
        point:Point; colour?: string;
    }

    export function newBox(point: Point, width: number, height:number, 
        colour:string='black'):Box{
        return {
            width:width, height:height,
            point:point, colour: colour,
        }
    }

    export function isInside(pos: Point, box:Box){
        return pos.x > box.point.x &&  pos.x < box.point.x + box.width &&
        pos.y > box.point.y && pos.y < box.point.y+box.height;
    }

    //export function mouseDownBox(pos: Point, box:Box):boolean{
    //}

    export function drawVerticalTripleBox(cr:CanvasRenderingContext2D, box:VerticalTripleBox){
        for(const b of box.boxes){
            cr.drawBox(b);
        }
    }

    export function drawBox(cr:CanvasRenderingContext2D, box:Box):void{
        const tr = cr.getTransform();
        cr.translate(box.point.x, box.point.y);
        cr.fillRect(0, 0, box.width, box.height);
        cr.setTransform(tr);
    }
}
*/