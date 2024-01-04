import { CanvasApp } from "../Canvas/Canvas";
import { InputChanges } from "../input/mouse";
import { AnimTime } from "../time/time";

function TestCanvas(){
    function animationStep(cr:CanvasRenderingContext2D, time:number, 
    inputChanges:InputChanges, animTime:AnimTime):void{
        cr.fillRect(10, 10, 40, 40);
        //do things here

    }
    return (
        <CanvasApp width={500} height={500} animationStep={animationStep}/>
    );
}

export default TestCanvas;