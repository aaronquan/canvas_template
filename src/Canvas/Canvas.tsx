import React, {MouseEventHandler, useEffect, useState, useRef} from 'react';

import { useAnim, InputChanges } from './Anim';
import { KeyState, useKeys } from '../input/keys';
import { MouseState, defaultMouseStateCreator } from '../input/mouse';

import { Point } from '../geometry/geometry';
import { AnimTime } from '../time/time';
import { useWindowSize } from '../hooks/Window';
import { useMouseMove } from '../hooks/Mouse';

const defaultWidth = 400;
const defaultHeight = 250;

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

export type WindowSize = {
    width: number; height:number;
}

type CanvasProps = {
    width?: number;
    height?: number;
    //canvasRef: HTMLCanvasElement;
    onInit?:(cr:CanvasRenderingContext2D) => void;
    onMouseMove?: (e:React.MouseEvent<HTMLCanvasElement>, canvas:HTMLCanvasElement) => void;
    onLeftMouseDown?: (e:React.MouseEvent<HTMLCanvasElement>) => void;
    onLeftMouseUp?: (e:React.MouseEvent<HTMLCanvasElement>) => void;
    onRightMouseDown?: (e:React.MouseEvent<HTMLCanvasElement>) => void;
    onRightMouseUp?: (e:React.MouseEvent<HTMLCanvasElement>) => void;
    onWheel?: (e:React.WheelEvent<HTMLCanvasElement>) => void;
    onUnload?: () => void;
    hideMouse?:boolean;
}

type CanvasAppProps= CanvasProps & {
    //width?:number; height?:number;
    animationStep?: (cr:CanvasRenderingContext2D, time:number, 
        inputChanges:InputChanges, animTime:AnimTime) => void;
    mouseState?: MouseState;
    onResize?: (newSize:WindowSize) => void;
    fullScreen?: boolean;
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
            console.log('initialising canvas');
        }
        return () => {
            console.log('unloading canvas');
        }
    }, [canvasRef]);
    function handleMouseMove(e:React.MouseEvent<HTMLCanvasElement>){
        function getMousePos(canvas:HTMLCanvasElement, 
            evt:React.MouseEvent<HTMLCanvasElement>) {
            const rect = canvas.getBoundingClientRect();
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
    function handleMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
        //anim.handleMouseDown(e);
        if(e.button === 0){
            if(props.onLeftMouseDown) props.onLeftMouseDown(e);
            mouseState.current.leftDown = true;
        }else if(e.button === 2){
            if(props.onRightMouseDown) props.onRightMouseDown(e);
            mouseState.current.rightDown = true;
        }
    }
    function handleMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
        //anim.handleMouseUp(e);
        if(e.button === 0){
            if(props.onLeftMouseUp) props.onLeftMouseUp(e);
            mouseState.current.leftDown = false;
        }else if(e.button === 2){
            if(props.onRightMouseUp) props.onRightMouseUp(e);
            mouseState.current.rightDown = false;
        }
    }
    function handleContextMenu(e:React.MouseEvent<HTMLCanvasElement>){
        e.preventDefault();
    }
    function handleWheel(e:React.WheelEvent<HTMLCanvasElement>){
        //const dir = e.deltaY > 0;
        if(props.onWheel) props.onWheel(e);
    }
    function handleUnload(){
        if(props.onUnload) props.onUnload();
    }
    //{/*style={{cursor: props.hideMouse ? 'none' : ''}}*/}
    return <canvas className={'GameCanvas'} ref={canvasRef}
    onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} 
    onMouseUp={handleMouseUp} onWheel={handleWheel}
    onContextMenu={handleContextMenu}
    width={props.width} height={props.height}/>;
}


export function useMouseState(state?:MouseState){
    const mouseState = state ? state: new MouseState();
    const canvasRect = useRef<DOMRect>();
    function handleMouseMove(e:React.MouseEvent<HTMLCanvasElement>, canvas:HTMLCanvasElement){
        if(!canvasRect.current){
            canvasRect.current = canvas.getBoundingClientRect();
        }
        const rect = canvasRect.current;
        const mouse =  new Point(e.clientX - rect.left, e.clientY - rect.top);
        mouseState.position = mouse;
    }
    function handleLeftMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
        mouseState.leftDown = true;
    }
    function handleLeftMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
        mouseState.leftDown = false;
    }
    function handleRightMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
        mouseState.rightDown = true;
    }
    function handleRightMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
        mouseState.rightDown = false;
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
        handleRightMouseDown: handleRightMouseDown,
        handleRightMouseUp: handleRightMouseUp,
        handleWheel: handleWheel
    }
}

export function CanvasApp(props:CanvasAppProps){
    const windowSize = props.fullScreen ? useWindowSize() : {width: props.width || defaultWidth, height: props.height || defaultHeight};
    const [renderer, setRenderer] = useState<CanvasRenderingContext2D | null>(null);
    const {
        mouseState:rawMouseState, 
        handleMouseMove: mouseMoveEvent, 
        handleLeftMouseDown: leftMouseDownEvent, 
        handleLeftMouseUp: leftMouseUpEvent, 
        handleRightMouseDown: rightMouseDownEvent,
        handleRightMouseUp: rightMouseUpEvent,
        handleWheel: wheelEvent} = useMouseState(props.mouseState);
    const {animTime} = useAnim(renderer, animationStep, props.mouseState);
    useEffect(() => {
        if(props.onResize) props.onResize(windowSize);
    }, [windowSize])
    function animationStep(cr:CanvasRenderingContext2D, time:number, inputChanges:InputChanges, animTime:AnimTime):void{
        if(props.animationStep) props.animationStep(cr, time, inputChanges, animTime);
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
    function handleRightMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
        rightMouseDownEvent(e);
        if(props.onRightMouseDown) props.onRightMouseDown(e);
    }
    function handleRightMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
        rightMouseUpEvent(e);
        if(props.onRightMouseUp) props.onRightMouseUp(e);
    }
    return <Canvas onInit={handleInit} width={windowSize.width} height={windowSize.height} 
    onMouseMove={handleMouseMove} onWheel={handleWheel} hideMouse={props.hideMouse}
    onLeftMouseDown={handleLeftMouseDown} onLeftMouseUp={handleLeftMouseUp} 
    onRightMouseDown={handleRightMouseDown} onRightMouseUp={handleRightMouseUp}/>;
}