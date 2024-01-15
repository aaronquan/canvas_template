import { Point } from "../geometry/geometry";
import { VirtRect } from "../geometry/shapes";

class BaseText{
    text:string;
    font: string;
    size: number; //in px
    colour: string;
    static font = 'Courier New';
    constructor(text:string, size?:number, font?:string, colour?:string){
        this.text = text;
        this.font = font ? font : 'Courier New'
        this.size = size ? size : 12;
        this.colour = colour ? colour : 'white';
    }
}

export class DrawText extends BaseText{
    textPoint: Point;
    maxWidth: number | undefined;
    //colour: string;
    constructor(text:string, bl:Point, size?:number, font?:string, colour?:string){
        super(text, size, font, colour);
        this.textPoint = bl; 
        this.colour = colour ? colour : 'white';
        this.maxWidth = undefined;
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.font = this.size.toString()+'px '+this.font;
        //console.log(cr.measureText(this.text));
        cr.fillStyle = this.colour;
        cr.fillText(this.text, this.textPoint.x, this.textPoint.y);
    }
    drawCentre(cr:CanvasRenderingContext2D):void{
        cr.font = this.size.toString()+'px '+this.font;
        const metrics = cr.measureText(this.text);
        const x = this.textPoint.x - (metrics.width/2);
        const y = this.textPoint.y + (this.size/2);
        cr.fillStyle = this.colour;
        cr.fillText(this.text, x, y, this.maxWidth);
    }
}

export class TextLines{
    textPoint: Point;
    texts: string[];
    font: string;
    size: number; //in px
    colour: string;
    constructor( bl:Point, size:number=15, font?:string, colour?:string){
        //super(text, size, font, colour);
        this.textPoint = bl; 
        this.size = size;
        this.font = font ? font : 'Courier New';
        this.colour = colour ? colour : 'white';
        this.texts = [];
    }
    moveTo(pt: Point){
        this.textPoint = pt;
    }
    getMaxWidth(cr:CanvasRenderingContext2D):number{
        cr.font = this.size.toString()+'px '+this.font;
        let max = 0;
        for(let i = 0; i < this.texts.length; ++i){
            const r = cr.measureText(this.texts[i]);
            if(r.width > max){
                max = r.width;
            }
        }
        return max;
    }
    draw(cr:CanvasRenderingContext2D):void{
        
        if(this.texts.length > 0){
            cr.font = this.size.toString()+'px '+this.font;
            cr.fillStyle = this.colour;
            let y = this.textPoint.y;
            for(let i=0; i< this.texts.length; i++){
                cr.fillText(this.texts[i], this.textPoint.x, y);
                y+= this.size + 3
            }
        }
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