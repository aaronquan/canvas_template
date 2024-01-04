import React, {MouseEventHandler, useEffect, useState, useRef} from 'react';
//import { defaultMouseStateCreator } from './Canvas';
import { MouseState, defaultMouseStateCreator } from '../input/mouse';
import {Point} from '../geometry/geometry';
import {AnimTime} from '../time/time';

//input changes since last update
export type InputChanges = {
    mouseMovement: Point;
    mouseScroll: number;
}

export function useAnim(cr:CanvasRenderingContext2D | null,
    animationStep?:(cr:CanvasRenderingContext2D, time:number, 
        inputChanges:InputChanges, animTime:AnimTime) => void, rawMouseState?:MouseState){
    const init = useRef(false);
    const animTime = useRef(new AnimTime());
    const mouseState = useRef<MouseState>(defaultMouseStateCreator());
    function step(time:number){
        animTime.current.frame(time);
        if(cr){
            if(animationStep){
                let inputChanges = {mouseMovement: new Point(), mouseScroll: 0};
                if(rawMouseState){
                    const movement = rawMouseState.position.diff(mouseState.current.position);
                    const scrolls = mouseState.current.scroll - rawMouseState.scroll;
                    inputChanges = {
                        mouseMovement: movement,
                        mouseScroll: scrolls
                    }
                    mouseState.current.matchState(rawMouseState);
                    //mouseState.current.scroll = rawMouseState.scroll;
                }
                animationStep(cr, time, inputChanges, animTime.current);
            }
        }
        if(init.current) window.requestAnimationFrame(step);
    }
    useEffect(() => {
        if(!init.current && cr){
            init.current = true;
            window.requestAnimationFrame(step);
        }
        return () => {
            console.log('unload animation?');
            init.current = false;
        }
    }, [cr]);
    return {animTime: animTime.current, /*frameMouseState: mouseState.current*/};
}