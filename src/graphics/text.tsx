import { Point } from "../geometry/geometry";
import { VirtRect } from "../geometry/shapes";

class BaseText{
    text:string;
    font: string;
    size: number; //in px
    colour: string;
    constructor(text:string, size?:number, font?:string, colour?:string){
        this.text = text;
        this.font = font ? font : 'Arial'
        this.size = size ? size : 12;
        this.colour = colour ? colour : 'white';
    }
}

export class DrawText extends BaseText{
    textPoint: Point;
    //colour: string;
    constructor(text:string, bl:Point, size?:number, font?:string, colour?:string){
        super(text, size, font, colour);
        this.textPoint = bl; 
        this.colour = colour ? colour : 'white';
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.font = this.size.toString()+'px '+this.font;
        //console.log(cr.measureText(this.text));
        cr.fillStyle = this.colour;
        cr.fillText(this.text, this.textPoint.x, this.textPoint.y);
    }
}

export class CenterBoxText extends BaseText{
    box:VirtRect;
    //text: string;
    constructor(text:string, pt:Point, width:number, height:number, size?:number, font?:string, colour?:string){
        super(text, size, font, colour);
        this.box = new VirtRect(pt.x, pt.y, width, height);
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.font = this.size.toString()+'px '+this.font;
        cr.fillStyle = this.colour;
        const measure = cr.measureText(this.text);

        const height = measure.fontBoundingBoxAscent + measure.fontBoundingBoxDescent;

        const textX = this.box.left+(this.box.width/2)-(measure.width/2);
        const textY = this.box.top+(this.box.height/2)+(height/4);
        cr.fillText(this.text, textX, textY);
    }
}