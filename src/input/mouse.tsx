import { Point } from '../geometry/geometry';

export type InputChanges = {
    mouseMovement: Point;
    mouseScroll: number;
    keys?: boolean;
}

export class MouseState{
    position:Point;
    leftDown: boolean;
    rightDown:boolean;
    scroll:number;
    constructor(){
        //console.log("inint mouse")
        this.position = new Point();
        this.leftDown = false;
        this.rightDown = false;
        this.scroll = 0;
    }
    positionString():string{
        return this.position.toString();
    }
    matchState(ms:MouseState){
        this.position = ms.position;
        this.leftDown = ms.leftDown;
        this.rightDown = ms.rightDown;
        this.scroll = ms.scroll;
    }
}

export const defaultMouseStateCreator = () => {
    return new MouseState();
}