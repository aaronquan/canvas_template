import { randomArrayElement } from "../math/Random";
import { BlockElement, BlockId, DirtBlock, DroppingBlock, 
    LiquidBlock, SedimentBlock, 
    StoneBlock, WoodBlock, 
    generateDroppingBlockFromId } from "./blocks";

//focus block and has other blocks around
//allows rotation
class DroppingBlockChain extends DroppingBlock{
    chain: BlockElement[];
    constructor(x?:number, y?:number){
        super(x, y);
        this.chain = [];
    }
}

const DroppingBlockIds = [
    BlockId.StoneBlock,
    BlockId.DirtBlock,
    BlockId.WoodBlock,
    BlockId.SedimentBlock,
    BlockId.LiquidBlock
];

export class RandomBlockDropper{
    constructor(){

    }
    sedimentBlock():SedimentBlock{
        return new SedimentBlock();
    }
    randomBlock():DroppingBlock{
        const blockId = randomArrayElement(DroppingBlockIds);
        if(blockId) return generateDroppingBlockFromId(blockId);
        return new StoneBlock();
        /*
        switch(blockId){
            case BlockId.StoneBlock:
                return new StoneBlock();
            case BlockId.DirtBlock:
                return new DirtBlock();
            case BlockId.WoodBlock:
                return new WoodBlock();
            case BlockId.SedimentBlock:
                return new SedimentBlock();
            case BlockId.LiquidBlock:
                return new LiquidBlock();
            default:
                console.log('Block not found')
        }
        return new StoneBlock();
        */
    }
}