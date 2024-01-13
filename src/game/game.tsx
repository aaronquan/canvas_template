import { Point, Vector2D } from "../geometry/geometry";
import { Coordinate2DType, DrawGrid2D, VirtualGrid2D } from "../geometry/grid";
import { VirtRect } from "../geometry/shapes";

import ReactLogo from './../assets/react.svg';
import { AbilityInterface, BlockInfo, BlockProbabilityInterface, ComboChooseInterface, ComboEngineInterface, ComboItemInterface, DropBlockPickerInterface, InterfaceBox, PauseMenu, ShapeProbabilityInterface, ShopInterface } from "./interface";

import { BlockElement, BlockId, DroppingBlock, SolidBlock, blockSize, generateBlockFromId } from "./blocks";
import { ControlledBlock,  RandomBlockGenerator, generateRandomBlock} from "./blockchain";
import { TimedEvent } from "../time/events";
import { CanvasScreen } from "../Canvas/Screen";
import { MouseEvent } from "react";
import { BlockCombo, BlockComboEngine, ComboFunction, PointEffect } from "./combo";
import { GravityParticleEffect, ParticleEffect, ParticleEngine } from "../graphics/particle";
import { getRandomInteger, getRandomRanges } from "../math/Random";
import CustomBlockCombos, { BlockCombos } from "./customCombos";
import { BlockLevelManager, level1Function } from "./level";
import { CustomText } from "../graphics/customText";
import { DrawText } from "../graphics/text";
import { ShopRandomiser } from "./shop";


export class GameCanvas implements CanvasScreen{
    gameGrid: GameGrid;
    background: null;
    quit: VirtRect;
    quitText: DrawText;
    onClickQuit: () => void;
    constructor(){
        this.gameGrid = new GameGrid();
        this.quit = new VirtRect(0, 0, 60, 30);
        this.quitText = new DrawText('Quit', new Point(), 15, undefined, 'white');
        this.onClickQuit = () => {};
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
        if(this.quit.hitPoint(pos)){
            this.onClickQuit();
        }
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
        cr.fillStyle = 'black';
        this.quit.fill(cr);
        this.quitText.draw(cr);
    }
    resize(winX: number, winY: number): void {
        this.gameGrid.resize(winX, winY);
        this.quit.moveTo(new Point(winX-80, 40));
        this.quitText.textPoint = new Point(this.quit.left+15, this.quit.top+this.quit.height/2);
    }
}

export class GameGrid{

    width: number;
    height: number; //screen dims

    grid: DrawGrid2D<BlockElement>;
    depth: number;
    gridPositions: VirtualGrid2D<Point>;

    spawnArea: VirtRect;

    solidBlocks: BlockElement[];
    //activeBlocksMap: {};

    //controlledBlock: DroppingBlock | null;
    controlledBlock: ControlledBlock | null;

    mouseHighlightedCell: Point | null;

    testRect: VirtRect | null;

    blockSpawnEvent: TimedEvent;
    blockTickEvent: TimedEvent;
    dropTickEvent: TimedEvent;
    dropTickTime: number;

    halfSecondEvent:TimedEvent;

    comboPauseTimer: TimedEvent | null;

    blockInfo: BlockInfo | null; // todo complete after coding 

    testTexture: CanvasPattern | null;

    //blockDropper: RandomBlockDropper;

    blockPickInterface: DropBlockPickerInterface;

    shapeProbabilityInterface: ShapeProbabilityInterface;
    blockProbabilityInterface: BlockProbabilityInterface;

    interfaces: Map<string, InterfaceBox>;
    //0 - shapeProbabilityInterface, 1 - blockProbabilityInterface

    comboEngine: BlockComboEngine;
    comboEngineInterface: ComboEngineInterface;

    particleEngine: ParticleEngine;
    screenShake: Point;

    animatedTexts: CustomText.AnimatedText[];

    isPaused: boolean;
    pauseMenu: PauseMenu;

    levelManager: BlockLevelManager;
    controlledBlockGenerator: RandomBlockGenerator;

    comboChooseInterface: ComboChooseInterface;

    //testCombo: BlockCombos.BlockComboBlocks;

    abilityBarInterface: AbilityInterface;
    
    shopRandom: ShopRandomiser;
    shopInterface: ShopInterface;

    static gridSize = 32;

    constructor(){
        console.log('init game');
        this.width = 0; this.height = 0;

        this.spawnArea = new VirtRect(0, 0, 0, 0);
        this.depth = 100;
        this.grid = new DrawGrid2D<BlockElement>(BlockElement, new Point(50, this.depth), 10, 18, GameGrid.gridSize);
        this.gridPositions = this.grid.getGridPositionsMap();
        this.solidBlocks = [];

        this.controlledBlock = null;

        this.mouseHighlightedCell = null;
        this.blockSpawnEvent = new TimedEvent(2000);
        this.dropTickTime = 500;
        this.dropTickEvent = new TimedEvent(this.dropTickTime);
        this.blockTickEvent = new TimedEvent(64);

        this.halfSecondEvent = new TimedEvent(500);

        this.comboPauseTimer = null;

        this.testRect = null;

        this.blockInfo = new BlockInfo(new Point(500, 400));

        this.testTexture = null;

        //this.blockDropper = new RandomBlockDropper();
        this.blockPickInterface = new DropBlockPickerInterface(new Point(500, 100), 
        [BlockId.WaterBlock, BlockId.DirtBlock, BlockId.SandBlock, BlockId.StoneBlock, BlockId.MegaStoneBlock]);

        this.comboEngine = new BlockComboEngine();
        this.comboEngineInterface = new ComboEngineInterface(this.comboEngine);

        this.comboChooseInterface = new ComboChooseInterface(new Point(100, 100), 600, 400);
        this.comboChooseInterface.active = false;
        /*
        const testCombo:ComboFunction = CustomBlockCombos.findNHorizontalCombo
        this.comboEngine.addComboFunction(testCombo, [3, BlockId.WaterBlock]);
        this.comboEngine.addComboFunction(testCombo, [3, BlockId.DirtBlock]);
        this.comboEngine.addComboFunction(CustomBlockCombos.findNVerticalCombineCombo, [2, BlockId.StoneBlock]);
        this.comboEngine.addComboFunction(CustomBlockCombos.findDirtWaterCombo);
        this.comboEngine.addComboFunction(testCombo, [2, BlockId.MegaStoneBlock]);
        */

        //this.interfaces = [];

        //this.nextCombo = [];
        //this.comboCount = 0;
        //this.particles = [];
        this.particleEngine = new ParticleEngine();
        this.animatedTexts = [];

        this.screenShake = new Point(0, 0);
        this.isPaused = false;
        this.pauseMenu = new PauseMenu();

        this.levelManager = new BlockLevelManager();
        this.controlledBlockGenerator = new RandomBlockGenerator();
        this.levelManager.initLevel0(this.controlledBlockGenerator, this.comboChooseInterface);

        this.controlledBlock = this.spawnControllingBlock(); // starts the spawning of blocks

        this.interfaces = new Map<string, InterfaceBox>();
        this.shapeProbabilityInterface = new ShapeProbabilityInterface(new Point(), 100, 200);
        this.blockProbabilityInterface = new BlockProbabilityInterface(new Point(), 100, 200);
        this.interfaces.set('shapeProbability', this.shapeProbabilityInterface);
        this.interfaces.set('blockProbability', this.blockProbabilityInterface);
        this.shapeProbabilityInterface.setData(this.controlledBlockGenerator.shapeProbabilities.asList());
        this.blockProbabilityInterface.setData(this.controlledBlockGenerator.blockProbabilities.asList());

        this.shopRandom = new ShopRandomiser();
        this.shopInterface = new ShopInterface();
        //this.testCombo = BlockCombos.newBlockComboBlocks();
    }
    resize(winX: number, winY: number){
        this.width = winX;
        this.height = winY;
        //put grid in center
        const halfGridWidth = this.grid.getDrawWidth() / 2;
        const halfScreenWidth = winX /2;
        this.grid.moveTo(new Point(halfScreenWidth-halfGridWidth, this.depth));
        const spawnHeight = 3*GameGrid.gridSize;
        this.spawnArea = new VirtRect(halfScreenWidth-halfGridWidth, this.depth-spawnHeight, this.grid.getDrawWidth(), spawnHeight);
        this.blockPickInterface.moveTo(new Point(halfScreenWidth+halfGridWidth+20, this.depth));
        this.blockInfo?.moveTo(new Point(halfScreenWidth+halfGridWidth+20, this.depth+this.grid.getDrawHeight()-200))
        this.comboEngineInterface.moveTo(new Point(halfScreenWidth+halfGridWidth+20, this.depth));

        this.interfaces.get('shapeProbability')?.moveTo(new Point(halfScreenWidth-halfGridWidth - 120, this.depth));
        this.interfaces.get('blockProbability')?.moveTo(new Point(halfScreenWidth-halfGridWidth - 120, this.depth + 220));
        this.comboChooseInterface.centre(this.width, this.height);
        
        this.shopInterface.moveTo(new Point(halfScreenWidth-halfGridWidth - 240, this.depth + this.grid.getDrawHeight() - 140));

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
                if(!this.controlledBlock.checkUnderIsBlock(this.grid)){
                    //this.controlledBlock.isControlling = false;
                    //this.controlledBlock = null;
                    const blocks:BlockElement[] = this.controlledBlock.getBlocks();
                    //console.log(blocks);
                    for(const block of blocks){
                        if(this.grid.isInGrid(block.x, block.y)){
                            this.grid.setGrid(block.x, block.y, block);
                        }else{
                            //also game over
                            console.log('game over');
                        }
                    }
                    this.controlledBlock = this.spawnControllingBlock();
                }else{
                    if(!this.controlledBlock.update(this.grid)){
                        console.log('game over');
                    }
                    //this.controlledBlock.move(this.grid, 0, 1);
                }
                
            }
        }

        //check for combo
        this.comboEngine.findCombos(this.grid);

    }
    executeCombos(){
        const comboEffects = this.comboEngine.execute(this.grid);
        this.particleEngine.addParticles(comboEffects.particleEffects);
        const countPoints = comboEffects.pointEffects.reduce((pts:number, pe:PointEffect) => {
            return pts + pe.value;
        }, 0);

        const animTexts = [];
        for(const effect of comboEffects.pointEffects){
            const newText = CustomText.newAnimatedText(effect.position, 
                effect.value.toString(), 'white', 20
            )
            newText.sizeChange = 0.01;
            newText.maxLifetime = 1000;
            newText.vx = Math.random()*0.01;
            newText.vy = Math.random()*0.01;
            animTexts.push(newText);
        }
        this.animatedTexts.push(...animTexts);

        const levelRet = this.levelManager.addPoints(countPoints, 
            this.controlledBlockGenerator, this.comboChooseInterface, this.comboEngine);
        

        if(levelRet.levelUp){
            //level up
            const levelUpText = CustomText.newAnimatedText(new Point((this.width/2)-20, (this.height/2)-10), 'LEVEL UP!', 'white', 30);
            levelUpText.maxLifetime = 4000;
            this.animatedTexts.push(levelUpText);
            this.comboEngineInterface.newCombos = true;
            
            this.blockProbabilityInterface.setData(this.controlledBlockGenerator.blockProbabilities.asList());
            this.shapeProbabilityInterface.setData(this.controlledBlockGenerator.shapeProbabilities.asList());
        }

        this.comboPauseTimer = new TimedEvent(250);
    }
    update(time:number){
        if(!this.isPaused && !this.comboChooseInterface.active){
            if(!this.comboPauseTimer){
                if(!this.comboEngine.hasCombos()){
                    this.updateBlocks(time);
                    //this.spawnBlockUpdate(time);
                }else{
                    //run combo
                    this.executeCombos();
                }
            }else{
                this.screenShake = new Point(getRandomRanges(0, 5), getRandomRanges(0, 5));
                const endPause = this.comboPauseTimer.step(time);
                if(endPause){
                    this.comboPauseTimer = null;
                    this.screenShake = new Point(0, 0);
                }
            }

            this.particleEngine.update(time);
            CustomText.updateAnimatedTexts(time, this.animatedTexts);


            if(this.mouseHighlightedCell){
                const mouseBlock = this.grid.getItem(this.mouseHighlightedCell.x, this.mouseHighlightedCell.y);
                this.blockInfo?.parseInfo(mouseBlock);
            }else{
                this.blockInfo?.noInfo();
            }

            const hs = this.halfSecondEvent.step(time);
            if(hs){
                this.comboEngineInterface.flicker();
            }
        }
    }
    spawnControllingBlock(): ControlledBlock{
        const gridRange = this.grid.getWidthRange();
        gridRange.setMax(gridRange.max-1);
        gridRange.setMin(gridRange.min+1);
        const rand = gridRange.getRandom();
        const newBlock = this.controlledBlockGenerator.generateRandomBlocks(rand);
        return newBlock;
    }

    //old spawn
    spawnBlock(): DroppingBlock | null{
        const gridRange = this.grid.getWidthRange();
        const rand = gridRange.getRandom();
        const newBlock = this.addNewBlock(rand, 0);
        if(newBlock && !this.controlledBlock){
            return newBlock;
        }
        if(!newBlock){
            console.log('you lost block cannot be placed');
        }
        return null;
    }
    spawnBlockUpdate(time:number){
        const blockSpawns = this.blockSpawnEvent.step(time);
        if(blockSpawns){
            this.spawnBlock();
        }
    }
    mouseMove(e:React.MouseEvent<HTMLCanvasElement>, pos: Point){
        if(!this.isPaused) this.mouseHighlightedCell = this.grid.getGridMouseCoordinates(pos);
        if(this.isPaused) this.pauseMenu.mouseMove(pos);
        //this.testRect = this.grid.gridRect.smartMouseRectInside(pos, 50, 30, 30);
    }
    mouseLeftDown(e:React.MouseEvent<HTMLCanvasElement>, pos:Point){
        //console.log(pos);
        if(!this.isPaused && !this.comboChooseInterface.active){
            /*
            if(this.mouseHighlightedCell){
                const block = generateBlockFromId(this.blockPickInterface.picked);
                this.addNewBlock(this.mouseHighlightedCell.x, this.mouseHighlightedCell.y, block);
            }
            */
            //this.blockPickInterface.mouseDown(pos); //disable block pick interface
            const ceiRet = this.comboEngineInterface.isClicked(pos);
            if(ceiRet.pickComboInterface){
                this.comboChooseInterface.active = true;
                this.comboEngineInterface.newCombos = false;
                //console.log(this.comboEngine.randomCombos);
            }
        }else{
            const mods = this.pauseMenu.mouseDown(pos);
            if(mods){
                if(mods.unpause) this.isPaused = false;
            }
        }

        if(this.comboChooseInterface.active){
            const ret = this.comboChooseInterface.isClicked(pos);
            if(ret !== null){
                //console.log(ret);
                for(const combo of ret){
                    this.comboEngine.addRandomCombos(combo);
                    this.comboEngineInterface.addCombo(combo);
                }
                this.comboChooseInterface.active = false;
                this.comboChooseInterface.changeNeedSelected(1);
            };
        }
        if(this.abilityBarInterface){

        }

    }
    mouseLeftUp(e:React.MouseEvent<HTMLCanvasElement>, pos:Point){

    }
    mouseRightDown(e:React.MouseEvent<HTMLCanvasElement>, pos:Point){
        //const block = generateDroppingBlockFromId(this.blockPickInterface.picked);
        if(this.mouseHighlightedCell){
            this.grid.setGrid(this.mouseHighlightedCell?.x, this.mouseHighlightedCell.y, new BlockElement());
        }
        this.comboChooseInterface.isClicked(pos);
        //if(this.comboChooseInterface.)
    }
    mouseRightUp(e:React.MouseEvent<HTMLCanvasElement>, pos:Point){

    }
    keyDown(e:KeyboardEvent, key:string){
        console.log(key);
        switch(key){
            case 'a':
                this.blockMoveLeft();
                break;
            case 'd':
                this.blockMoveRight();
                break;
            case 's':
                this.dropTickEvent.interval = this.blockTickEvent.interval;
                break;
            case 'e':
                this.controlledBlock?.rotateClockwise(this.grid);
                break;
            case 'q':
                this.controlledBlock?.rotateAntiClockwise(this.grid);
                break;
            case 'z':
                //adds random combo
                /*
                const combo = BlockCombos.generateCombo(this.controlledBlockGenerator.blockProbabilities);
                console.log(combo);
                this.testCombo = combo;
                this.comboEngine.addRandomCombos(combo);
                */

                //const comboItem = new ComboItemInterface(new Point(10, 10), combo);
                //this.comboChooseInterface.items = items;
                //this.comboEngine.
                break;
            case ' ':
                this.updateGrid();
                console.log('update grid');
                break;
            case 'Escape':
                //console.log('escape');
                this.isPaused = !this.isPaused;
                break;
        }
    }
    keyUp(e:KeyboardEvent, key:string){
        switch(key){
            case 's':
                this.dropTickEvent.interval = this.dropTickTime;
                break;
        }
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
            const newBlock = block ? block : generateRandomBlock();
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
        /*
        if(!this.controlledBlock?.isDropping){
            this.controlledBlock = null;
        }
        */
    }
    drawOverCell(cr:CanvasRenderingContext2D, pt: Point){

    }

    draw(cr:CanvasRenderingContext2D):void{
        cr.translate(this.screenShake.x, this.screenShake.y);

        cr.fillStyle = 'black';
        cr.fillText('Points: '+this.levelManager.points, 20, 25);
        cr.fillText('Level: '+this.levelManager.level, 20, 50);
        cr.fillText('Coins: '+this.levelManager.coins, 20, 75);

        cr.fillStyle = 'black';
        this.spawnArea.fill(cr);
        this.grid.draw(cr);

        //draw outline
        if(this.controlledBlock){
            const position = this.grid.getGridPosition(this.controlledBlock.x, this.controlledBlock.y);
            cr.strokeStyle = 'green';
            cr.strokeRect(position.x, position.y, this.grid.gridSize, this.grid.gridSize);
        }
        this.controlledBlock?.draw(cr, this.grid);

        if(this.mouseHighlightedCell){
            const position = this.grid.getGridPosition(this.mouseHighlightedCell.x, this.mouseHighlightedCell.y);
            cr.fillStyle = '#ff000044';
            cr.fillRect(position.x, position.y, this.grid.gridSize, this.grid.gridSize);
        }
        if(this.testRect){
            this.testRect.draw(cr);
        }

        if(this.blockInfo) this.blockInfo.draw(cr);
        //this.blockPickInterface.draw(cr);
        /*
        for(const particle of this.particles){
            particle.draw(cr);
        }
        */
        this.particleEngine.draw(cr);

        if(this.isPaused && !this.comboChooseInterface.active) this.pauseMenu.draw(cr, this.width, this.height);

        for(const [_id, inter] of this.interfaces){
            inter.draw(cr);
        }

        //draw custom combos that player can make on screen
        //this.comboEngine.drawCombos(cr, (this.width/2)+(this.grid.getDrawWidth()/2)+10, 
        //this.grid.position.y+300);
        this.comboEngineInterface.draw(cr);
        
        CustomText.drawAnimatedTexts(cr, this.animatedTexts);

        this.shopInterface.draw(cr);

        this.comboChooseInterface.draw(cr, this.width, this.height);
        //console.log(this.comboChooseInterface.active = );

        cr.resetTransform();
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

