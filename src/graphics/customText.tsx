import { Point } from "../geometry/geometry";
import { DrawText } from "./text";



export namespace CustomText{

    export type AnimatedText = {
        position: Point;
        text:string;
        colour: string;

        currentLifetime: number;
        maxLifetime?: number;

        vx?:number;
        vy?:number
        size: number;
        sizeChange?: number;
    }

    export function newAnimatedText(pos?:Point, text:string='', colour:string='black', size:number=10):AnimatedText{
        return {
            position: pos ? pos : new Point(0, 0),
            text: text,
            colour: colour,
            currentLifetime: 0,
            size: size
        }
    }
    export function updateAnimatedTexts(time: number, texts:AnimatedText[]):AnimatedText[]{
        for(let i=texts.length-1; i >= 0; --i){
            const isDel = updateAnimatedText(time, texts[0]);
            if(isDel){
                texts.splice(i, 1);
            }
        }
        return texts;
    }

    //returns above lifetime
    export function updateAnimatedText(time: number, text:AnimatedText):boolean{
        if(text.sizeChange){
            const sc = text.sizeChange*time;
            text.size += sc;
        }
        if(text.vx){
            const mx = text.vx*time;
            text.position.x += mx;
        }
        if(text.vy){
            const my = text.vy*time;
            text.position.y += my;
        }
        text.currentLifetime += time;
        if(text.maxLifetime) return text.currentLifetime > text.maxLifetime;
        return false;
    }

    export function drawAnimatedTexts(cr:CanvasRenderingContext2D, texts:AnimatedText[]){
        for(const text of texts){
            drawAnimatedText(cr, text);
        }
    }

    export function drawAnimatedText(cr:CanvasRenderingContext2D, text:AnimatedText):void{
        cr.fillStyle = text.colour;
        cr.font = Math.floor(text.size) + 'px' + DrawText.font;
        cr.fillText(text.text, text.position.x, text.position.y);

        //if(text.sizeChange) text.size += text.sizeChange;
    }


}