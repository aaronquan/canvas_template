import { MouseEvent } from "react";
import { CanvasScreen } from "../Canvas/Screen";
import { Point } from "../geometry/geometry";
import { VirtRect } from "../geometry/shapes";
import { DrawText } from "../graphics/text";
import { drawBackground, newBlocks } from "./background";


export class GameMenu implements CanvasScreen{
    background: null;
    playButton: VirtRect;
    playText: DrawText;
    onClickPlay: () => void;
    width: number;
    height:number
    constructor(){
        this.playButton = new VirtRect(0, 0, 100, 100);
        this.playText = new DrawText('PLAY', new Point());
        this.onClickPlay = () => {};
        this.width = 0;
        this.height = 0;
    }
    update(time:number){
        
    }
    resize(winX: number, winY: number): void {
        this.width = winX; this.height = winY
        
        this.playButton.moveTo(new Point(winX/2 - this.playButton.width/2, winY/2 - this.playButton.height/2));
        this.playText.textPoint = new Point(winX/2, winY/2);
        newBlocks(winX, winY);
        setTimeout(() => {
            newBlocks(winX, winY);
        }, 100)
    }
    changeScreen?(screenId: number): void {
        throw new Error("Method not implemented.");
    }
    onChangeScreen(){

    };
    mouseMove(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        //throw new Error("Method not implemented.");
    }
    mouseLeftDown(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        if(this.playButton.hitPoint(pos)){
            this.onClickPlay();
        }
    }
    mouseLeftUp(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        //throw new Error("Method not implemented.");
    }
    mouseRightDown(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        //throw new Error("Method not implemented.");
    }
    mouseRightUp(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        //throw new Error("Method not implemented.");
    }
    keyDown(e: KeyboardEvent, key: string): void {
        //throw new Error("Method not implemented.");
    }
    keyUp(e: KeyboardEvent, key: string): void {
        //throw new Error("Method not implemented.");
    }
    draw(cr: CanvasRenderingContext2D): void {
        drawBackground(cr, this.width, this.height);
        cr.fillStyle = 'black';
        this.playButton.fill(cr);
        cr.fillStyle = 'white';
        this.playText.drawCentre(cr);
    }


}