import { Point } from "../geometry/geometry";


export interface CanvasScreen{
    resize?(winX:number, winY:number):void;
    changeScreen?(screenId:number):void;
    onChangeScreen?:()=>void;
    mouseMove?(e:React.MouseEvent<HTMLCanvasElement>, pos:Point):void;
    mouseLeftDown?(e:React.MouseEvent<HTMLCanvasElement>, pos:Point):void;
    mouseLeftUp?(e:React.MouseEvent<HTMLCanvasElement>, pos:Point):void;
    mouseRightDown?(e:React.MouseEvent<HTMLCanvasElement>, pos:Point):void;
    mouseRightUp?(e:React.MouseEvent<HTMLCanvasElement>, pos:Point):void;
    keyDown?(e:KeyboardEvent, key:string):void;
    keyUp?(e:KeyboardEvent, key:string):void;
    draw(cr:CanvasRenderingContext2D):void;
}

export class CanvasScreenManager implements CanvasScreen{
    screens: CanvasScreen[];
    currentScreen: number | null;
    renderChangeScreen: boolean;
    width:number;
    height:number;
    constructor(width?:number, height?:number){
        this.screens = [];
        this.currentScreen = null;
        this.renderChangeScreen = false;
        this.width = width ? width : 0;
        this.height = height ? height : 0;
    }
    mouseMove(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        if(this.currentScreen !== null) this.screens[this.currentScreen].mouseMove?.(e, pos);
    }
    mouseLeftDown(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        if(this.currentScreen !== null) this.screens[this.currentScreen].mouseLeftDown?.(e, pos);
    }
    mouseLeftUp(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        if(this.currentScreen !== null) this.screens[this.currentScreen].mouseLeftUp?.(e, pos);
    }
    mouseRightDown(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        if(this.currentScreen !== null) this.screens[this.currentScreen].mouseRightDown?.(e, pos);
    }
    mouseRightUp(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        if(this.currentScreen !== null) this.screens[this.currentScreen].mouseRightUp?.(e, pos);
    }
    keyDown(e: KeyboardEvent, key: string): void {
        if(this.currentScreen !== null) this.screens[this.currentScreen].keyDown?.(e, key);
    }
    keyUp(e: KeyboardEvent, key: string): void {
        if(this.currentScreen !== null) this.screens[this.currentScreen].keyUp?.(e, key);
    }
    generateScreenChangeFunction(newScreen:number){
        return () => {
            this.changeScreen(newScreen);
        }
    }
    changeScreen(screenId: number): CanvasScreen {
        this.currentScreen = screenId;
        this.renderChangeScreen = true;
        const screen = this.screens[screenId];
        if(screen.onChangeScreen) screen.onChangeScreen();
        return this.screens[screenId];
    }
    addScreen(screen:CanvasScreen){
        this.screens.push(screen);
        if(this.currentScreen === null) this.currentScreen = 0;
    }
    resize(winX:number, winY:number){
        this.screens.forEach((screen) => {
            if(screen.resize) screen.resize(winX, winY);
        });
        this.width = winX;
        this.height = winY;
    }
    draw(cr: CanvasRenderingContext2D): void {
        if(this.renderChangeScreen){
            this.renderChangeScreen = false;
            cr.clearRect(0, 0, this.width, this.height);
        }
        if(this.currentScreen !== null) this.screens[this.currentScreen].draw(cr);
    }
}