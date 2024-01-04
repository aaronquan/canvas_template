import React, {MouseEventHandler, useEffect, useState, useRef} from 'react';

import { useAnim, InputChanges } from './Anim';
import { KeyState, useKeys } from '../input/keys';
import { MouseState, defaultMouseStateCreator } from '../input/mouse';

import { Point } from '../geometry/geometry';
import { AnimTime } from '../time/time';


type GridProps = {
    rows: number,
    columns: number,
    squareSize: number,
    colour1: string,
    colour2: string,
    context: CanvasRenderingContext2D | null
}

export type MousePosition = {
    x: number,
    y: number
}

export interface CanvasScreen{
    resize?(winX:number, winY:number):void;
    changeScreen?(screenId:number):void;
    onChangeScreen?:()=>void;
    mouseMove(e:React.MouseEvent<HTMLCanvasElement>, pos:Point):void;
    mouseDown(e:React.MouseEvent<HTMLCanvasElement>, pos:Point):void;
    mouseUp(e:React.MouseEvent<HTMLCanvasElement>, pos:Point):void;
    keyDown(e:KeyboardEvent, key:string):void;
    keyUp(e:KeyboardEvent, key:string):void;
    draw(cr:CanvasRenderingContext2D):void;
}

export class CanvasScreenManager implements CanvasScreen{
    screens: CanvasScreen[];
    currentScreen: number | null;
    renderChangeScreen: boolean;
    width:number;
    height:number;
    constructor(width:number, height:number){
        this.screens = [];
        this.currentScreen = null;
        this.renderChangeScreen = false;
        this.width = width;
        this.height = height;
    }
    mouseMove(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        if(this.currentScreen !== null) this.screens[this.currentScreen].mouseMove(e, pos);
    }
    mouseDown(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        if(this.currentScreen !== null) this.screens[this.currentScreen].mouseDown(e, pos);
    }
    mouseUp(e: React.MouseEvent<HTMLCanvasElement>, pos: Point): void {
        if(this.currentScreen !== null) this.screens[this.currentScreen].mouseUp(e, pos);
    }
    keyDown(e: KeyboardEvent, key: string): void {
        if(this.currentScreen !== null) this.screens[this.currentScreen].keyDown(e, key);
    }
    keyUp(e: KeyboardEvent, key: string): void {
        if(this.currentScreen !== null) this.screens[this.currentScreen].keyUp(e, key);
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

type CanvasProps = {
    width: number;
    height: number;
    //canvasRef: HTMLCanvasElement;
    onInit?:(cr:CanvasRenderingContext2D) => void;
    onMouseMove?: (e:React.MouseEvent<HTMLCanvasElement>, canvas:HTMLCanvasElement) => void;
    onLeftMouseDown?: (e:React.MouseEvent<HTMLCanvasElement>) => void;
    onLeftMouseUp?: (e:React.MouseEvent<HTMLCanvasElement>) => void;
    onWheel?: (e:React.WheelEvent<HTMLCanvasElement>) => void;
    onUnload?: () => void;
}

export function Canvas(props:CanvasProps){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseState = useRef<MouseState>(
        defaultMouseStateCreator()
    );
    useEffect(() => {
        if(canvasRef.current){
            const ct = canvasRef.current.getContext('2d');
            if(ct && props.onInit) props.onInit(ct);
            console.log('initCanvas');
        }
        return () => {
            console.log('unload canvas');
        }
    }, [canvasRef]);
    function handleMouseMove(e:React.MouseEvent<HTMLCanvasElement>){
        function getMousePos(canvas:HTMLCanvasElement, 
            evt:React.MouseEvent<HTMLCanvasElement>) {
            var rect = canvas.getBoundingClientRect();
            return new Point(evt.clientX - rect.left, 
                evt.clientY - rect.top);
        }
        if(canvasRef.current){
            const mousePos = getMousePos(canvasRef.current, e);
            mouseState.current.position = mousePos;
            //if(props.onMouseMove) props.onMouseMove(mousePos);
            if(props.onMouseMove) props.onMouseMove(e, canvasRef.current);
        }
    }
    function handleLeftMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
        //anim.handleMouseDown(e);
        if(props.onLeftMouseDown) props.onLeftMouseDown(e);
        mouseState.current.leftDown = true;
    }
    function handleLeftMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
        //anim.handleMouseUp(e);
        if(props.onLeftMouseUp) props.onLeftMouseUp(e);
        mouseState.current.leftDown = false;
    }
    function handleWheel(e:React.WheelEvent<HTMLCanvasElement>){
        //console.log(e);
        //const dir = e.deltaY > 0;
        if(props.onWheel) props.onWheel(e);
    }
    function handleUnload(){

    }
    return <canvas ref={canvasRef}
    onMouseMove={handleMouseMove} onMouseDown={handleLeftMouseDown} 
    onMouseUp={handleLeftMouseUp} onWheel={handleWheel}
    width={props.width} height={props.height}/>;
}


export function useMouseState(state?:MouseState){
    const mouseState = state ? state: new MouseState();
    /*
    const mouseState = useRef<MouseState>(
        defaultMouseStateCreator()
    );*/
    //const scrollChanges = useRef<number>(0);
    function handleMouseMove(e:React.MouseEvent<HTMLCanvasElement>, canvas:HTMLCanvasElement){
        const rect = canvas.getBoundingClientRect();
        const mouse =  new Point(e.clientX - rect.left, e.clientY - rect.top);
        mouseState.position = mouse;
    }
    function handleLeftMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
        mouseState.leftDown = true;
    }
    function handleLeftMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
        mouseState.leftDown = false;
    }
    function handleWheel(e:React.WheelEvent<HTMLCanvasElement>){
        const dir = e.deltaY > 0;
        if(dir){
            mouseState.scroll += 1;
        }else{
            mouseState.scroll -= 1;
        }
    }
    return {
        mouseState:mouseState,
        handleMouseMove: handleMouseMove,
        handleLeftMouseDown: handleLeftMouseDown,
        handleLeftMouseUp: handleLeftMouseUp,
        handleWheel: handleWheel
    }
}

type CanvasAppProps= CanvasProps & {
    width:number; height:number;

    /*onInit?:(cr:CanvasRenderingContext2D) => void;
    onMouseMove?: (e:React.MouseEvent<HTMLCanvasElement>, canvas:HTMLCanvasElement) => void;
    onLeftMouseDown?: (e:React.MouseEvent<HTMLCanvasElement>) => void;
    onLeftMouseUp?: (e:React.MouseEvent<HTMLCanvasElement>) => void;
    onWheel?: (e:React.WheelEvent<HTMLCanvasElement>) => void;
    onUnload?: () => void;*/
    animationStep?: (cr:CanvasRenderingContext2D, time:number, 
        inputChanges:InputChanges, animTime:AnimTime) => void;
    mouseState?: MouseState;
}

export function CanvasApp(props:CanvasAppProps){
    const [renderer, setRenderer] = useState<CanvasRenderingContext2D | null>(null);
    const {
        mouseState:rawMouseState, 
        handleMouseMove: mouseMoveEvent, 
        handleLeftMouseDown: leftMouseDownEvent, 
        handleLeftMouseUp: leftMouseUpEvent, 
        handleWheel: wheelEvent} = useMouseState(props.mouseState);
    const {animTime} = useAnim(renderer, animationStep, props.mouseState);

    function animationStep(cr:CanvasRenderingContext2D, time:number, inputChanges:InputChanges, animTime:AnimTime):void{
        if(props.animationStep) props.animationStep(cr, time, inputChanges, animTime);
        //console.log('anim');
    }

    function handleInit(cr:CanvasRenderingContext2D){
        if(props.onInit) props.onInit(cr);
        setRenderer(cr);
    }
    function handleMouseMove(e:React.MouseEvent<HTMLCanvasElement>, canvas:HTMLCanvasElement){
        mouseMoveEvent(e, canvas);
        if(props.onMouseMove) props.onMouseMove(e, canvas);
    }
    function handleWheel(e:React.WheelEvent<HTMLCanvasElement>){
        wheelEvent(e);
        if(props.onWheel) props.onWheel(e);
    }
    function handleLeftMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
        leftMouseDownEvent(e);
        if(props.onLeftMouseDown) props.onLeftMouseDown(e);
    }
    function handleLeftMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
        leftMouseUpEvent(e);
        if(props.onLeftMouseUp) props.onLeftMouseUp(e);
    }
    return <Canvas onInit={handleInit} width={props.width} height={props.height} 
    onMouseMove={handleMouseMove} onWheel={handleWheel}
    onLeftMouseDown={handleLeftMouseDown} onLeftMouseUp={handleLeftMouseUp}/>;
}