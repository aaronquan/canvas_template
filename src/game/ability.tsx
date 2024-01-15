import { BlockElement, generateBlockFromId } from "./blocks";
import { BlockCombos } from "./customCombos";
import { GameGrid } from "./game";


export type Ability = {
    id:number;
    params: any[];
    cost: number;
}

export class AbilityManager{
    currentAbility: Ability | undefined;
    activatedAbility: number | undefined;

    constructor(){
        this.currentAbility = undefined;
        this.activatedAbility = undefined;
    }

    run(game:GameGrid){
        if(this.currentAbility !== undefined){
            const payed = game.levelManager.payCoins(this.currentAbility.cost);
            //console.log('run abiltiy');
            const params = this.currentAbility.params;
            if(payed){
                switch(this.currentAbility.id){
                    case 0:
                        //randomise blocks
                        game.comboEngineInterface.combos[params[0]]
                        .randomise(game.controlledBlockGenerator);
                        break;

                    case 1:
                        const coords = params[0]
                        game.grid.setGrid(coords.x, coords.y, new BlockElement());
                        break;
                    case 2:
                        const combo = params[0];
                        const index = params[1];
                        //console.log(index);
                        combo.blocks.splice(index, 1);
                        let hasX = false;
                        for(const b of combo.blocks){
                            if(b.x === 0){
                                hasX = true; break;
                            }
                        }
                        if(!hasX) combo.blocks.forEach((b:any) => {
                            b.x -= 1;
                        });
                        //check x if none -> shift

                        combo.range = BlockCombos.getBlockRange(combo.blocks);
                        //console.log(combo);
                        break;
                    case 3:
                        //console.log(params);
                        const type = params[0];
                        const block = params[1];
                        const grid = params[2];
                        const newBlock = generateBlockFromId(type);
                        grid.setGrid(block.x, block.y, newBlock);
                        //block.
                        break;
                    case 4:
                        const t = params[0];
                        const b = params[1];
                        //console.log(b);
                        b.id = t;
                        break;
                    default:
                        console.log('no ability');
                        break;
                }
            }
            else{
                game.mouseOverInterface.setTexts(['Insufficient Coins']);
                game.mouseOverInterface.setLock();

            }
        }
    }
}