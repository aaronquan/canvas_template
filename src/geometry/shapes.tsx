import { Point, Region, Vector2D } from "./geometry";

enum ShapeTypes {
    Rect, Circle, Triangle, Polygon
}

export interface VirtShape{
    type: ShapeTypes;
    move:(mo:Point)=>void;
    draw:(cr:CanvasRenderingContext2D)=>void;
    fill:(cr:CanvasRenderingContext2D)=>void;
    hitPoint:(pt:Point)=>boolean;
    hitRect:(rect:VirtRect)=>boolean;
    hitShape:(shape:VirtShape)=>boolean;
}

export class VirtRect implements VirtShape{
    type: ShapeTypes = ShapeTypes.Rect;
    left: number;top:number;
    right:number;bottom:number;
    width: number;
    height: number;
    cx: number; cy:number; //center points
    constructor(x:number, y:number, wid:number, hei:number){
        this.left = x; this.top = y;
        this.right = x+wid; this.bottom = y+hei;
        this.width = wid; this.height = hei;

        this.cx = this.left + (wid / 2);
        this.cy = this.top + (hei / 2);
    }
    changeDimensions(w:number, h:number){
        this.width = w;
        this.height = h;
        this.right = this.left+this.width;
        this.bottom = this.top+this.height;

        this.cx = this.left + (this.width / 2);
        this.cy = this.top + (this.height / 2);
    }
    move(mo:Point){
        this.left += mo.x;
        this.right += mo.x;
        this.top += mo.y;
        this.bottom += mo.y;
        this.cx += mo.x;
        this.cy += mo.y;
    }
    moveTo(pt:Point){
        this.left = pt.x;
        this.right = pt.x+this.width;
        this.top = pt.y;
        this.bottom = pt.y+this.height;
        this.cx = this.left + (this.width / 2);
        this.cy = this.top + (this.height / 2);
    }
    moveN(x:number, y:number){
        this.left += x;
        this.right += x;
        this.top += y;
        this.bottom += y;
        this.cx += x;
        this.cy += y;
    }
    hitPoint(pt:Point){
        return pt.x > this.left && pt.x < this.right
        && pt.y > this.top && pt.y < this.bottom;
    }
    hitShape(shape:VirtShape):boolean{
        if(shape instanceof VirtRect){
            return this.hitRect(shape);
        }
        //else if(shape instanceof VirtCircle){
            //return this.hitCircle(shape);
        //}
        return false;
    }
    pointRegion(pt:Point){
        if(pt.x < this.left){
            if(pt.y < this.top){
                return Region.left_top;
            }else if(pt.y > this.bottom){
                return Region.left_bottom;
            }
            return Region.left;
        }else if(pt.x > this.right){
            if(pt.y < this.top){
                return Region.right_top;
            }else if(pt.y > this.bottom){
                return Region.right_bottom;
            }
            return Region.right;
        }
        if(pt.y < this.top){
            return Region.top;
        }else if(pt.y > this.bottom){
            return Region.bottom;
        }
        return Region.inside;
    }
    isInsideY(y:number){
        return y < this.bottom && y > this.top;
    }
    isInsideX(x:number){
        return x < this.right && x > this.left;
    }
    hitRect(vr:VirtRect):boolean{
        return !(this.left > vr.right ||
            this.right < vr.left ||
            this.top > vr.bottom ||
            this.bottom < vr.top);
    }
    draw(cr:CanvasRenderingContext2D){
        cr.strokeRect(this.left, this.top, this.width, this.height);
    }
    fill(cr:CanvasRenderingContext2D){
        cr.fillRect(this.left, this.top, this.width, this.height);
    }
    static fromSides(left:number, top:number, right:number, bottom:number):VirtRect{
        const width = right - left;
        const height = bottom - top;
        return new VirtRect(left, top, width, height);
    }
    getPoints():Point[]{
        return [new Point(this.left, this.top), new Point(this.right, this.top), new Point(this.right, this.bottom), new Point(this.left, this.bottom)];
    }
    closestCornerOrthogonalDistance(pt:Point):{corner:Point, vector:Vector2D, distance: number}{
        const points = this.getPoints();
        const output = {corner: points[0], vector: new Vector2D(), distance: 0};
        for(let i = 0; i<points.length; i++){
            const vec = points[i].diffVector(pt);
            const distance = vec.x + vec.y;
            if(distance < output.distance){
                output.corner = points[i];
                output.vector = vec;
                output.distance = distance;
            }
        }
        return output;
    }
    furthestCornerOrthogonalDistance(pt:Point):{corner:Point, vector:Vector2D, distance: number}{
        const points = this.getPoints();
        const firstVec = points[0].diffVector(pt);
        const output = {
            corner: points[0], vector: firstVec, 
            distance: Math.abs(firstVec.x) + Math.abs(firstVec.y)};
        for(let i = 1; i<points.length; i++){
            const vec = points[i].diffVector(pt);
            const distance = Math.abs(vec.x) + Math.abs(vec.y);
            if(distance > output.distance){
                output.corner = points[i];
                output.vector = vec;
                output.distance = distance;
            }
        }
        return output;
    }
    smartMouseRectInside(pt:Point, distance: number, rectWidth:number, rectHeight:number):VirtRect{
        const furthestEdge = this.furthestCornerOrthogonalDistance(pt);
        const vec = furthestEdge.vector;
        vec.norm(); vec.multi(distance);
        //const rectWidth = 100; const rectHeight = 100;
        const rx = vec.x > 0 ? vec.x + pt.x : vec.x + pt.x - rectWidth; 
        const rv = vec.y > 0 ? vec.y + pt.y : vec.y + pt.y - rectHeight;
        return new VirtRect(rx, rv, rectWidth, rectHeight);
    }
}


export class VirtRectPoint implements VirtShape{
    type: ShapeTypes = ShapeTypes.Rect;
    p1: Point; // top
    p2: Point;
    //width: number;
    //height: number;
    //cx: number; cy:number; //center points
    //colour: string | undefined;
    constructor(p1: Point, p2:Point){
        this.p1 = p1;
        this.p2 = p2;
    }
    move(mo:Point){
        this.p1.add(mo);
        this.p2.add(mo);
    }
    moveN(x:number, y:number){
        this.move(new Point(x, y));
    }
    
    draw(cr:CanvasRenderingContext2D){
        const width = this.p2.x - this.p1.x;
        const height = this.p2.y - this.p1.y;
        cr.strokeRect(this.p1.x, this.p1.y, width, height);  
    }
    hitPoint(pt:Point){
        return this.isInsideX(pt.x) && this.isInsideY(pt.y);
        //&& pt.y > this.p1.y && pt.y < this.p2.y;
    }
    hitShape(shape:VirtShape):boolean{
        if(shape instanceof VirtRect){
            return this.hitRect(shape);
        }
        return false;
    }
    pointRegion(pt:Point){
        if(pt.x < this.p1.x){
            if(pt.y < this.p1.y){
                return Region.left_top;
            }else if(pt.y > this.p2.y){
                return Region.left_bottom;
            }
            return Region.left;
        }else if(pt.x > this.p2.x){
            if(pt.y < this.p1.y){
                return Region.right_top;
            }else if(pt.y > this.p2.y){
                return Region.right_bottom;
            }
            return Region.right;
        }
        if(pt.y < this.p1.y){
            return Region.top;
        }else if(pt.y > this.p2.y){
            return Region.bottom;
        }
        return Region.inside;
    }
    isInsideY(y:number){
        return y < this.p2.y && y > this.p1.y;
    }
    isInsideX(x:number){
        return x < this.p2.x && x > this.p1.y;
    }
    hitRect(vr:VirtRect):boolean{
        return !(this.p1.x > vr.right ||
            this.p2.x < vr.left ||
            this.p1.y > vr.bottom ||
            this.p2.y < vr.top);
    } 
    fill(cr:CanvasRenderingContext2D){
        const width = this.p2.x - this.p1.x;
        const height = this.p2.y - this.p1.y;
        cr.fillRect(this.p1.x, this.p1.y, width, height);  
    }
    static fromSides(left:number, top:number, right:number, bottom:number):VirtRect{
        const width = right - left;
        const height = bottom - top;
        return new VirtRect(left, top, width, height);
    }
    getPoints():Point[]{
        return [new Point(this.p1.x, this.p1.y), new Point(this.p2.x, this.p1.y), 
            new Point(this.p1.y, this.p2.y), new Point(this.p1.x, this.p2.y)];
    }
    closestCornerOrthogonalDistance(pt:Point):{corner:Point, vector:Vector2D, distance: number}{
        //let maxDistance = 0;
        const points = this.getPoints();
        const output = {corner: points[0], vector: new Vector2D(), distance: 0};
        for(let i = 0; i<points.length; i++){
            const vec = points[i].diffVector(pt);
            const distance = vec.x + vec.y;
            if(distance < output.distance){
                output.corner = points[i];
                output.vector = vec;
                output.distance = distance;
            }
        }
        return output;
    }
    furthestCornerOrthogonalDistance(pt:Point):{corner:Point, vector:Vector2D, distance: number}{
        const points = this.getPoints();
        const firstVec = points[0].diffVector(pt);
        const output = {corner: points[0], vector: firstVec, distance: firstVec.x + firstVec.y};
        for(let i = 1; i<points.length; i++){
            const vec = points[i].diffVector(pt);
            const distance = vec.x + vec.y;
            if(distance > output.distance){
                output.corner = points[i];
                output.vector = vec;
                output.distance = distance;
            }
        }
        return output;
    }
}

