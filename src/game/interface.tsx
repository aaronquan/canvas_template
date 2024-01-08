import { Point } from "../geometry/geometry";
import { VirtRect } from "../geometry/shapes";
import { DrawText } from "../graphics/text";
import { BlockElement, BlockIds, blockTypeStrings } from "./blocks";


export class BlockInfo{
    box:VirtRect;
    coordinate:DrawText;

    typeInfo:DrawText;
    constructor(pos:Point){
        this.box = new VirtRect(pos.x, pos.y, 200, 200);
        this.coordinate = new DrawText('', new Point(pos.x, pos.y+15), 15);
        this.typeInfo = new DrawText('', new Point(pos.x, pos.y+35), 15);
    }
    parseInfo(b: BlockElement){
        const info = b.getInfo();
        const p = new Point(info.x, info.y);
        this.coordinate.text = p.toString();
        const typeString:string = blockTypeStrings[info.type as BlockIds];
        this.typeInfo.text = 'Type: ' + typeString;
    }
    noInfo(){
        this.coordinate.text = '';
        this.typeInfo.text = '';
    }
    draw(cr:CanvasRenderingContext2D):void{
        cr.fillStyle = 'black';
        this.box.fill(cr);
        this.box.draw(cr);
        this.coordinate.draw(cr);
        this.typeInfo.draw(cr);
    }
}