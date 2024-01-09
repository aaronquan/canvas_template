import { BlockElement, SolidBlock } from "../game/blocks";
import { IntegerRange } from "../math/Ranges";
import { Point, Vector2D } from "./geometry";
import { VirtRect, VirtRectPoint } from "./shapes";


export interface Coordinate2DType{
    newCoordinates:(x:number, y:number) => void;
    update:(grid:DrawGrid2D<BlockElement>) => void;
    draw:(cr:CanvasRenderingContext2D, size:number, position?:Point) => void;
    //isEmpty:() => boolean;
    //default:() => Coordinate2DType;
    //new(...args:any[]): T;
}

interface CoordinateConstructor<T> {
    new(...args:any[]): T;
}

function coordinateConstructorType<T extends Coordinate2DType>(type: CoordinateConstructor<T>, typeArgs?:any[]): T {
    return typeArgs ? new type(...typeArgs) : new type();
}

export class VirtualGrid2D<Type>{
    width: number;
    height:number;
    grid: Type[][];
    //widthRange: IntegerRange;
    //heightRange: IntegerRange;
    constructor(width:number, height:number){
        this.width = width;
        this.height = height;
        //this.widthRange = new IntegerRange(0, width);
        //this.heightRange = new IntegerRange(0, height);
        this.grid = [];
        for (let y = 0; y < height; y++){
            this.grid.push([]);
            for(let x = 0; x < width; x++){
                const sv = null;
                this.grid[y].push(sv as Type);
            }
        }
    }
    isInX(x:number):boolean{
        return x >= 0 && x < this.width;
    }
    isInY(y:number):boolean{
        return y >= 0 && y < this.height;
    }
    isInGrid(x:number, y:number):boolean{
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    getItem(x:number, y:number):Type{
        return this.grid[y][x];
    }
    swapGrid(i:number, j:number, x:number, y:number){
        const v = this.grid[y][x];
        this.grid[y][x] = this.grid[j][i];
        this.grid[j][i] = v;
    }
    setGrid(x:number, y:number, v:Type){
        if(x < this.width && y < this.height){
            this.grid[y][x] = v;
        }
    }
    setFullGrid(v:Coordinate2DType){
        for (let i = 0; i < this.height; i++){
            this.grid[i] = Array(this.width).fill(v);
        }
    }
    getWidthRange():IntegerRange{
        return new IntegerRange(0, this.width-1);
    }
}


export class VirtualCoordinateObjectGrid2D<Type extends Coordinate2DType> extends VirtualGrid2D<Type>{
    //width: number;
    //height:number;
    grid: Type[][];
    constructor(width:number, height:number, T:CoordinateConstructor<Type>, typeArgs?:any[]){
        super(width, height);
        //this.width = width;
        //this.height = height;
        this.grid = [];
        for (let y = 0; y < height; y++){
            this.grid.push([]);
            for(let x = 0; x < width; x++){
                const sv:Type = coordinateConstructorType(T, typeArgs);
                if(sv && sv.newCoordinates){
                    sv.newCoordinates(x, y);
                }
                this.grid[y].push(sv);
            }
        }
    }
}

export class DrawGrid2D<Type extends Coordinate2DType> extends VirtualCoordinateObjectGrid2D<Type>{
    position: Point;
    gridSize: number;

    gridRect: VirtRect;

    showGridLines: boolean;
    flipY: boolean;
    constructor(type:CoordinateConstructor<Type>, position: Point, width: number, height:number, gridSize:number, typeArgs?:any[]){
        super(width, height, type, typeArgs);
        this.position = position;
        this.gridSize = gridSize;
        this.showGridLines = true;
        this.flipY = false;
        this.gridRect = new VirtRect(this.position.x, this.position.y, this.gridSize*width, this.gridSize*height);
    }
    move(vec:Vector2D){
        this.position.addVector(vec);
        this.gridRect.moveN(vec.x, vec.y);
    }
    moveTo(pt: Point){
        this.position = pt;
        this.gridRect.moveTo(pt);
    }
    getDrawWidth():number{
       return this.gridSize*this.width; 
    }
    swapGrid(i:number, j:number, x:number, y:number){
        this.getItem(i, j).newCoordinates(x, y);
        this.getItem(x, y).newCoordinates(i, j);
        super.swapGrid(i, j, x, y);
    }
    setGrid(x: number, y: number, v: Type): void {
        super.setGrid(x, y, v);
        v.newCoordinates(x, y);
    }
    getGridPosition(x: number, y: number):Point{
        return new Point(this.position.x+x*this.gridSize, this.position.y+y*this.gridSize);
    }
    getRow(y:number):Type[]{
        return this.grid[y];
    }
    getGridPositionsMap():VirtualGrid2D<Point>{
        const newVirtualGrid = new VirtualGrid2D<Point>(this.width, this.height);
        const posMap:Point[][] = [];
        for(let y=0; y<this.height; y++){
            const heightLevel = this.position.y+this.gridSize*y;
            posMap.push([]);
            for(let x=0; x<this.width; x++){
                const widthLevel = this.position.x+this.gridSize*x;
                const position = new Point(widthLevel, heightLevel);
                //posMap[y].push(position);
                newVirtualGrid.setGrid(x, y, position);
            }
        }
        return newVirtualGrid;
    }
    getGridMouseCell(pt:Point):Type | null{
        const coords = this.getGridMouseCoordinates(pt);
        if(coords){
            return this.getItem(coords.x, coords.y);
        }
        return null;
        /*
        if(!this.gridRect.hitPoint(pt)) return null;
        const x = Math.floor((pt.x - this.position.x) / this.gridSize);
        const y = Math.floor((pt.y - this.position.y) / this.gridSize);
        return this.getItem(x, y);*/
    }

    getGridMouseCoordinates(pt:Point): Point | null{
        if(!this.gridRect.hitPoint(pt)) return null;
        const x = Math.floor((pt.x - this.position.x) / this.gridSize);
        const y = Math.floor((pt.y - this.position.y) / this.gridSize);
        return new Point(x, y);
    }
    //array with closest first
    getLeftItems(x:number, y:number):Type[]{
        const items = [];
        for(let i = x-1; i >= 0; --i){
            items.push(this.getItem(i, y));
        }
        return items;
    }

    getRightItems(x:number, y:number):Type[]{
        const items = [];
        for(let i = x+1; i < this.width; ++i){
            items.push(this.getItem(i, y));
        }
        return items;
    }
    /*
    updateTick(){
        for(let y = this.height-1; y >= 0; --y){
            for(let x = 0; x < this.width; ++x){
                const item = this.getItem(x, y);
                item.update(this)
            }
        }
    }*/

    drawBackground(cr:CanvasRenderingContext2D):void{
        //draw grid area
        //const gridWidth = this.width*this.gridSize;
        //const gridHeight = this.height*this.gridSize;
        cr.fillStyle = 'black';
        this.gridRect.fill(cr);
        //cr.fillRect(this.position.x, this.position.y, 
        //    gridWidth, gridHeight);
        cr.strokeStyle = 'red';
        //cr.strokeRect(this.position.x, this.position.y, 
        //    gridWidth, gridHeight);
        this.gridRect.draw(cr);
    }

    drawGrid(cr:CanvasRenderingContext2D):void{
        const gridWidth = this.gridRect.width;
        const gridHeight = this.gridRect.height;
        if(this.showGridLines){
            for(let y = 1; y<this.height; y++){
                const lineHeightLevel = this.position.y+this.gridSize*y;
                cr.beginPath();
                cr.moveTo(this.position.x, lineHeightLevel);
                cr.lineTo(this.position.x+gridWidth, lineHeightLevel);
                cr.closePath();
                cr.stroke();
            }
            for(let x = 1; x<this.width; x++){
                const lineWidthLevel = this.position.x + this.gridSize*x;
                cr.beginPath();
                cr.moveTo(lineWidthLevel, this.position.y);
                cr.lineTo(lineWidthLevel, this.position.y+gridHeight);
                cr.closePath();
                cr.stroke();
            }
        }
    }

    drawBlocks(cr:CanvasRenderingContext2D):void{
        for(let y = 0; y<this.height; ++y){
            for(let x = 0; x<this.width; ++x){
                //console.log(this.getGridPosition(x, y));
                const item = this.getItem(x, y);
                item.draw(cr, this.gridSize, this.getGridPosition(x, y));
            }
        }
    }

    draw(cr:CanvasRenderingContext2D):void{
        //draw grid area
        
        const gridWidth = this.width*this.gridSize;
        const gridHeight = this.height*this.gridSize;
        cr.fillStyle = 'black';
        cr.fillRect(this.position.x, this.position.y, 
            gridWidth, gridHeight);
        cr.strokeStyle = 'red';
        cr.strokeRect(this.position.x, this.position.y, 
            gridWidth, gridHeight);
        cr.strokeStyle = 'grey';
        if(this.showGridLines){
            this.drawGrid(cr);
        }

        this.drawBlocks(cr);
    }
}