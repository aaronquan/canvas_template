import { getRandomInteger, randomArrayElement } from "../math/Random";
import { IntegerRange } from "../math/Ranges";
import { BlockId, generateBlockFromId } from "./blocks";


const blockIds = [BlockId.StoneBlock, BlockId.WoodBlock, BlockId.FloatBlock, BlockId.ABlock, BlockId.SprinkleBlock];

type BlockAnim = {
    tex: string | CanvasPattern,
    x: number, y:number,
    scale:number;
    rot:number;
    rotC: number;
}
let blocks:BlockAnim[] = [

];

export function newBlocks(width:number, height:number){
    blocks = [];
    for(let i = 0; i < 120; i++){
        const r = randomArrayElement(blockIds);
        if(r){
            const bl = generateBlockFromId(r);
            //cr.fillStyle = bl.getColour();
            const x = getRandomInteger(width);
            const y = getRandomInteger(height);
            const rs= new IntegerRange(1, 10);
            const scale = rs.getRandom()
            const rot =  Math.random()*2*Math.PI;
            const rotc = Math.random()*0.004;
            blocks.push({
                tex: bl.getColour(),
                x: x, y: y, scale: scale,
                rot: rot, rotC: rotc
            })
        }
    }
}

export function drawBackground(cr: CanvasRenderingContext2D, width:number, height:number){
    cr.fillStyle = '#999999';
    cr.fillRect(0,0,width, height);
    const blockIds = [BlockId.StoneBlock, BlockId.WoodBlock, BlockId.FloatBlock, BlockId.ABlock, BlockId.SprinkleBlock];
    //const blocks = [];
    for(const block of blocks){
        block.rot += block.rotC;
        const tr = cr.getTransform();
        cr.fillStyle = block.tex;
        cr.rotate(block.rot);
        //cr.translate(-16*block.scale, -16*block.scale);
        cr.scale(block.scale, block.scale);
        cr.translate(block.x, block.y);
        cr.fillRect(0, 0, 32, 32);
        cr.setTransform(tr);
    }

    cr.fillStyle = '#00000044';
    cr.fillRect(0,0,width, height);

    const size = new IntegerRange(1, 6);


}