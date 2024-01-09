import { Point } from "../geometry/geometry";
import { Coordinate2DType, DrawGrid2D, VirtualGrid2D } from "../geometry/grid";
import { VirtRect } from "../geometry/shapes";

import ReactLogo from './../assets/react.svg';
import { BlockInfo, DropBlockPickerInterface } from "./interface";

import { BlockElement, BlockId, DroppingBlock, SolidBlock, generateDroppingBlockFromId } from "./blocks";
import { RandomBlockDropper } from "./blockchain";
import { TimedEvent } from "../time/events";
import { CanvasScreen } from "../Canvas/Screen";
import { MouseEvent } from "react";
import { BlockCombo } from "./combo";

const svg = document.createElementNS(ReactLogo, 'svg');

export class GameCanvas implements CanvasScreen{
    gameGrid: GameGrid;
    constructor(){
        this.gameGrid = new GameGrid();
    }
    update(time:number){
        this.gameGrid.update(time);
    }
    changeScreen?(screenId: number): void {
        throw new Error("Method not implemented.");
    }
    onChangeScreen: (() => void) | undefined;
    mouseMove(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        this.gameGrid.mouseMove(e, pos);
    }
    mouseLeftDown(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        this.gameGrid.mouseLeftDown(e, pos);
    }
    mouseLeftUp(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        this.gameGrid.mouseLeftUp(e, pos);
    }
    mouseRightDown(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        this.gameGrid.mouseRightDown(e, pos);
    }
    mouseRightUp(e: MouseEvent<HTMLCanvasElement>, pos: Point): void {
        //this.gameGrid.mouseRightUp(e, pos);
    }
    keyDown(e: KeyboardEvent, key: string): void {
        this.gameGrid.keyDown(e, key);
    }
    keyUp(e: KeyboardEvent, key: string): void {
        this.gameGrid.keyUp(e, key);
    }
    draw(cr: CanvasRenderingContext2D): void {
        this.gameGrid.draw(cr);
    }
    resize(winX: number, winY: number): void {
        this.gameGrid.resize(winX, winY);
    }
}

export class GameGrid{
    grid: DrawGrid2D<BlockElement>;
    gridPositions: VirtualGrid2D<Point>;

    solidBlocks: BlockElement[];
    //activeBlocksMap: {};

    controlledBlock: SolidBlock | null;

    mouseHighlightedCell: Point | null;

    testRect: VirtRect | null;

    blockSpawnEvent: TimedEvent;
    blockTickEvent: TimedEvent;

    blockInfo: BlockInfo | null; // todo complete after coding 

    testTexture: CanvasPattern | null;

    blockDropper: RandomBlockDropper;

    blockPickInterface: DropBlockPickerInterface;

    nextCombo: BlockCombo[];

    constructor(){
        console.log('init game');
        this.grid = new DrawGrid2D<BlockElement>(BlockElement, new Point(50, 50), 10, 20, 40);
        this.gridPositions = this.grid.getGridPositionsMap();
        this.solidBlocks = [];

        this.controlledBlock = null;

        this.mouseHighlightedCell = null;
        this.blockSpawnEvent = new TimedEvent(100);
        this.blockTickEvent = new TimedEvent(32);

        this.testRect = null;

        this.blockInfo = new BlockInfo(new Point(500, 400));

        this.testTexture = null;

        this.blockDropper = new RandomBlockDropper();
        this.blockPickInterface = new DropBlockPickerInterface(new Point(500, 100), 
        [BlockId.LiquidBlock, BlockId.DirtBlock, BlockId.SedimentBlock, BlockId.StoneBlock]);

        this.nextCombo = [];
    }
    resize(winX: number, winY: number){
        //put grid in center
        const halfGridWidth = this.grid.getDrawWidth() / 2;
        const halfScreenWidth = winX /2;
        this.grid.moveTo(new Point(halfScreenWidth-halfGridWidth, 50));
        this.blockPickInterface.moveTo(new Point(halfScreenWidth+halfGridWidth+20, 50));
        this.blockInfo?.moveTo(new Point(halfScreenWidth+halfGridWidth+20, 200))
    }
    updateGrid(){
        const blocks = [];
        for(let y = this.grid.height-1; y >= 0; --y){
            for(let x = 0; x < this.grid.width; ++x){
                blocks.push(this.grid.getItem(x, y));
            }
        }
        for(const block of blocks){
            block.update(this.grid);
        }
    }
    findCombos(): BlockCombo[]{
        const combos:BlockCombo[] = [];
        for(let y = 0; y < this.grid.height; ++y){
            const row = this.grid.getRow(y);

            //let comboCount = 0;
            let currentCombo = new BlockCombo([]);
            let currentBlocks:BlockElement[] = [];
            for(let i = 0; i<row.length; ++i){
                const block = row[i];
                if(!block.isDropping && block.type === BlockId.StoneBlock){
                //if(block.type === BlockId.StoneBlock){
                    currentBlocks.push(block);
                    //comboCount++;
                }else{
                    //comboCount = 0;
                    currentBlocks = [];
                }
                if(currentBlocks.length === 2){ // 2 combo blocks
                    //create new combo
                    currentCombo = new BlockCombo(currentBlocks);
                    combos.push(currentCombo);
                }else if(currentBlocks.length > 2){
                    // add to combo
                    currentCombo.addToCombo(block);
                }
            }
        }
        return combos;
    }
    update(time:number){
        if(this.nextCombo.length === 0){
            //not combo stop game for combo effect
            const blockTicks = this.blockTickEvent.step(time);
            //for(let i = 0; i<blockTicks; i++){
            if(blockTicks > 0) this.updateGrid();
            //}
            //check for combo
            const combos = this.findCombos();
            console.log(combos);
            this.nextCombo = combos;
            //test combos
            //horizontal dirt is removed // vertical stone is removed

        }else{
            //run combo
            while(this.nextCombo.length > 0){
                const combo = this.nextCombo.pop();
                combo?.execute(this.grid);
            }

        }

        //this.spawnBlockUpdate(time);

        if(this.mouseHighlightedCell){
            const mouseBlock = this.grid.getItem(this.mouseHighlightedCell.x, this.mouseHighlightedCell.y);
            this.blockInfo?.parseInfo(mouseBlock);
        }else{
            this.blockInfo?.noInfo();
        }
    }

    spawnBlockUpdate(time:number){
        const blockSpawns = this.blockSpawnEvent.step(time);
        if(blockSpawns){
            //for testing spawn random block on width
            const gridRange = this.grid.getWidthRange();
            const rand = gridRange.getRandom();
            const newBlock = this.addNewBlock(rand, 0);
            if(newBlock && !this.controlledBlock){
                this.controlledBlock = newBlock;
                //console.log(this.controlledBlock);
            }
            if(!newBlock){
                console.log('you lost block cannot be placed');
            }
        }
    }
    mouseMove(e:React.MouseEvent<HTMLCanvasElement>, pos: Point){
        this.mouseHighlightedCell = this.grid.getGridMouseCoordinates(pos);
        //this.testRect = this.grid.gridRect.smartMouseRectInside(pos, 50, 30, 30);
    }
    mouseLeftDown(e:React.MouseEvent<HTMLCanvasElement>, pos:Point){
        //console.log(pos);
        if(this.mouseHighlightedCell){
            const block = generateDroppingBlockFromId(this.blockPickInterface.picked);
            this.addNewBlock(this.mouseHighlightedCell.x, this.mouseHighlightedCell.y, block);
        }
        this.blockPickInterface.mouseDown(pos);
    }
    mouseLeftUp(e:React.MouseEvent<HTMLCanvasElement>, pos:Point){

    }
    mouseRightDown(e:React.MouseEvent<HTMLCanvasElement>, pos:Point){
        //const block = generateDroppingBlockFromId(this.blockPickInterface.picked);
        if(this.mouseHighlightedCell){
            this.grid.setGrid(this.mouseHighlightedCell?.x, this.mouseHighlightedCell.y, new BlockElement());
        }
    }
    keyDown(e:KeyboardEvent, key:string){
        switch(key){
            case 'a':
                this.blockMoveLeft();
                break;
            case 'd':
                this.blockMoveRight();
                break;
            case ' ':
                this.updateGrid();
                console.log('update grid');
                break;
        }
        if(key === 'q'){
            console.log(this.grid);
        }
    }
    keyUp(e:KeyboardEvent, key:string){

    }
    blockMove(x:number, y:number=0){
        //this.controlledBlock
        if(this.controlledBlock){
            this.controlledBlock.move(this.grid, x, y);
            /*
            const nx = this.controlledBlock.x+x;
            const ny = this.controlledBlock.y+y;
            if(this.grid.isInGrid(nx, ny)){
                const examineBlock = this.grid.getItem(nx, ny);
                if(!examineBlock.isSolid){
                    this.grid.swapGrid(this.controlledBlock.x, 
                        this.controlledBlock.y, nx, ny);
                }
            }
            */
        }
    }
    blockMoveLeft(){
        this.blockMove(-1);
    }
    blockMoveRight(){
        this.blockMove(1);
    }
    addNewBlock(x:number, y:number, block?:DroppingBlock):DroppingBlock | null{
        
        if(this.grid.getItem(x, y).isEmpty){
            //aconst newSolid = this.blockDropper.sedimentBlock(); 
            // drops sediment only
            const newBlock = block ? block : this.blockDropper.randomBlock();
            this.grid.setGrid(x, y, newBlock);
            this.solidBlocks.push(newBlock);
            //console.log('add block');
            return newBlock;
        }
        return null;
    }
    blockTick(){
        for(const block of this.solidBlocks){
            block.update(this.grid);
        }
        if(!this.controlledBlock?.isDropping){
            this.controlledBlock = null;
        }
    }
    drawOverCell(cr:CanvasRenderingContext2D, pt: Point){

    }

    draw(cr:CanvasRenderingContext2D):void{
        this.grid.draw(cr);

        //draw outline
        if(this.controlledBlock){
            const position = this.grid.getGridPosition(this.controlledBlock.x, this.controlledBlock.y);
            cr.strokeStyle = 'green';
            cr.strokeRect(position.x, position.y, this.grid.gridSize, this.grid.gridSize);
        }

        if(this.mouseHighlightedCell){
            const position = this.grid.getGridPosition(this.mouseHighlightedCell.x, this.mouseHighlightedCell.y);
            cr.fillStyle = '#ff000044';
            cr.fillRect(position.x, position.y, this.grid.gridSize, this.grid.gridSize);
        }
        if(this.testRect){
            this.testRect.draw(cr);
        }

        if(this.blockInfo) this.blockInfo.draw(cr);
        this.blockPickInterface.draw(cr);
        /*
        if(this.testTexture){
            //textures also scale
            cr.scale(2,2);
            cr.fillStyle = this.testTexture;
            cr.fillRect(0, 0, 500, 500);
            cr.resetTransform();
        }
        */
    }
}

//const colours = {};
//export { BlockElement };

