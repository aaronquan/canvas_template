import { randomArrayElement } from "../math/Random";
import { BlockElement, BlockIds, DirtBlock, DroppingBlock, SedimentBlock, StoneBlock, WoodBlock } from "./blocks";

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
    BlockIds.StoneBlock,
    BlockIds.DirtBlock,
    BlockIds.WoodBlock,
    BlockIds.SedimentBlock,
    BlockIds.LiquidBlock
];

export class RandomBlockDropper{
    constructor(){

    }
    sedimentBlock():SedimentBlock{
        return new SedimentBlock();
    }
    randomBlock():DroppingBlock{
        const blockId = randomArrayElement(DroppingBlockIds);
        switch(blockId){
            case BlockIds.StoneBlock:
                return new StoneBlock();
            case BlockIds.DirtBlock:
                return new DirtBlock();
            case BlockIds.WoodBlock:
                return new WoodBlock();
            case BlockIds.SedimentBlock:
                return new SedimentBlock();
            default:
                console.log('Random block not found')

        }
        return new StoneBlock();
    }
}