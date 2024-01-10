import { Point, Vector2D } from "../geometry/geometry";
import { Coordinate2DType, DrawGrid2D, VirtualGrid2D } from "../geometry/grid";
import { VirtRect } from "../geometry/shapes";

import ReactLogo from './../assets/react.svg';
import { BlockInfo, DropBlockPickerInterface } from "./interface";

import { BlockElement, BlockId, DroppingBlock, SolidBlock, generateDroppingBlockFromId } from "./blocks";
import { RandomBlockDropper } from "./blockchain";
import { TimedEvent } from "../time/events";
import { CanvasScreen } from "../Canvas/Screen";
import { MouseEvent } from "react";
import { BlockCombo, BlockComboEngine, ComboFunction } from "./combo";
import { GravityParticleEffect, ParticleEffect, ParticleEngine } from "../graphics/particle";
import { getRandomInteger, getRandomRanges } from "../math/Random";
import CustomBlockCombos from "./customCombos";

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
        this.gameGrid.mouseRightUp(e, pos);
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

    controlledBlock: DroppingBlock | null;

    mouseHighlightedCell: Point | null;

    testRect: VirtRect | null;

    blockSpawnEvent: TimedEvent;
    blockTickEvent: TimedEvent;
    dropTickEvent: TimedEvent;

    blockInfo: BlockInfo | null; // todo complete after coding 

    testTexture: CanvasPattern | null;

    blockDropper: RandomBlockDropper;

    blockPickInterface: DropBlockPickerInterface;

    nextCombo: BlockCombo[];
    comboCount: number;
    comboEngine: BlockComboEngine;

    //particles: ParticleEffect[];
    particleEngine: ParticleEngine;

    constructor(){
        console.log('init game');
        this.grid = new DrawGrid2D<BlockElement>(BlockElement, new Point(50, 50), 10, 20, 40);
        this.gridPositions = this.grid.getGridPositionsMap();
        this.solidBlocks = [];

        this.controlledBlock = null;

        this.mouseHighlightedCell = null;
        this.blockSpawnEvent = new TimedEvent(2000);
        this.dropTickEvent = new TimedEvent(100);
        this.blockTickEvent = new TimedEvent(64);

        this.testRect = null;

        this.blockInfo = new BlockInfo(new Point(500, 400));

        this.testTexture = null;

        this.blockDropper = new RandomBlockDropper();
        this.blockPickInterface = new DropBlockPickerInterface(new Point(500, 100), 
        [BlockId.LiquidBlock, BlockId.DirtBlock, BlockId.SedimentBlock, BlockId.StoneBlock]);

        this.comboEngine = new BlockComboEngine;
        const testCombo:ComboFunction = CustomBlockCombos.findNHorizontalStoneCombo
        this.comboEngine.addComboFunction(testCombo);
        this.comboEngine.addComboFunction(CustomBlockCombos.findVerticalStoneCombo);

        //this.nextCombo = [];
        //this.comboCount = 0;
        //this.particles = [];
        this.particleEngine = new ParticleEngine();

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
    /*
    findCombos(): BlockCombo[]{
        const combos:BlockCombo[] = [];
        combos.push(...CustomBlockCombos.findNHorizontalStoneCombo(this.grid, 5));
        const vertStoneCombo = CustomBlockCombos.findVerticalStoneCombo(this.grid);
        combos.push(...vertStoneCombo);
        this.comboEngine.addCombos(vertStoneCombo);
        return combos;
    }*/

    updateBlocks(time:number){
        //not combo stop game for combo effect
        const blockTicks = this.blockTickEvent.step(time);
        if(blockTicks > 0) this.updateGrid(); //only do 1 tick regardless of time spent

        const dropTick = this.dropTickEvent.step(time);
        if(dropTick > 0){
            if(this.controlledBlock){
                if(this.controlledBlock.checkUnderIsBlock(this.grid)){
                    this.controlledBlock.isControlling = false;
                    this.controlledBlock = null;

                    //call next block TODO
                }else{
                    this.controlledBlock.move(this.grid, 0, 1);
                }
            }
        }

        //check for combo
        this.comboEngine.findCombos(this.grid);

    }
    update(time:number){
        if(!this.comboEngine.hasCombos()){
            this.updateBlocks(time);
            //this.spawnBlockUpdate(time);
        }else{
            //run combo
            /*
            for(const combo of this.nextCombo){
                //console.log(combo);
                combo.execute(this.grid);
                const blocks = combo.blocks;
                for(const block of blocks){
                    //add particle effect
                    const position = this.grid.getGridPosition(block.x, block.y);
                    const randX = getRandomInteger(this.grid.gridSize);
                    const randY = getRandomInteger(this.grid.gridSize);
                    const particlePosition = new Point(position.x+randX, position.y+randY);
                    const angle = getRandomRanges(Math.PI, Math.PI+Math.PI);
                    const vec = Vector2D.fromAngle(angle);
                    
                    const particle = new GravityParticleEffect(particlePosition, vec);
                    particle.colour = 'green';
                    vec.multi(150);
                    this.particleEngine.addParticle(particle);
                }
            }
            this.nextCombo = [];
            */
           const comboEffects = this.comboEngine.execute(this.grid);
           this.particleEngine.addParticles(comboEffects.particleEffects);
        }

        this.particleEngine.update(time);


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
                this.controlledBlock.isControlling = true;
                this.controlledBlock.isDropping = true;
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
    mouseRightUp(e:React.MouseEvent<HTMLCanvasElement>, pos:Point){

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
        for(const particle of this.particles){
            particle.draw(cr);
        }
        */
        this.particleEngine.draw(cr);
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

