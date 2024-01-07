
export const Region = Object.freeze({
    inside: Symbol('inside'),
    left: Symbol('left'),
    left_top: Symbol('top_left'),
    top: Symbol('top'),
    right_top: Symbol('right_top'),
    right: Symbol('right'),
    right_bottom: Symbol('right_bottom'),
    bottom: Symbol('bottom'),
    left_bottom: Symbol('left_bottom')
});

export class Point{
    x: number;
    y: number;
    constructor(x?:number, y?:number){
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }
    set(p:Point){
        this.x = p.x;
        this.y = p.y;
    }
    add(p:Point){
        this.x += p.x;
        this.y += p.y;
    }
    addVector(v:Vector2D){
        this.x += v.x;
        this.y += v.y;
    }
    sub(p:Point){
        this.x -= p.x;
        this.y -= p.y;
    }
    negPoint(){
        return new Point(-this.x, -this.y);
    }
    moveN(x:number, y:number){
        this.x += x;
        this.y += y;
    }
    floor(){
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
    }
    diff(p:Point){
        return new Point(this.x - p.x, this.y - p.y);
    }
    diffVector(p:Point):Vector2D{
        return new Vector2D(this.x - p.x, this.y - p.y);
    }
    distance2(p:Point){
        const dx = this.x - p.x; const dy = this.y - p.y;
        return dx*dx + dy*dy;
    }
    multiplyPoint(x:number, y?:number){
        if(y !== undefined){
            return new Point(this.x*x, this.y*y);
        }
        return new Point(this.x*x, this.y*x);
    }
    dividePoint(x:number, y?:number){
        if(y !== undefined){
            return new Point(this.x/x, this.y/y);
        }
        if(x !== 0){
            return new Point(this.x/x, this.y/x);
        }
        return new Point(0, 0);
    }
    arr(){
        return [this.x, this.y];
    }
    copy(){
        return new Point(this.x, this.y);
    }
    toString():string{
        return 'x: '+this.x.toFixed(2)+', y: '+this.y.toFixed(2);
    }
    static fromArr(arr:number[]):Point{
        if(arr.length >= 2){
            return new Point(arr[0], arr[1]);
        }
        return new Point();
    }
    static random(xr:number, yr:number):Point{
        const x = Math.floor(Math.random()*xr);
        const y = Math.floor(Math.random()*yr)
        return new Point(x, y);
    }
    static randomRange(lowX:number, rangeX:number, lowY: number, rangeY: number):Point{
        const xr = Math.random()*rangeX;
        const yr = Math.random()*rangeY;
        return new Point(xr+lowX, yr+lowY);
    }
    closest(pts:Point[]):Point{
        if(pts.length === 0){
            return new Point();
        }
        const sVec = this.diffVector(pts[0]);
        let minDist = sVec.distFast();
        let index = 0;
        for(let i = 1; i < pts.length; i++){
            const vec = this.diffVector(pts[i]);
            const dist = vec.distFast();
            if(dist < minDist){
                minDist = dist;
                index = i;
            }
        }
        return pts[index];
    }
}

export class Vector2D{
    x:number;
    y:number;
    constructor(x?:number, y?:number){
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }
    add(vec:Vector2D){
        this.x += vec.x;
        this.y += vec.y;
    }
    div(d:number){
        if(d !== 0){
            this.x /= d; 
            this.y /= d;
        }
    }
    mag(){
        return Math.sqrt(this.distFast());
    }
    distFast(){
        return this.x*this.x + this.y*this.y;
    }
    norm(){
        this.div(this.mag());
    }
    copy(){
        return new Vector2D(this.x, this.y);
    }
    multi(m: number){
        this.x *= m;
        this.y *= m;
    }
    rotate(rad:number){
        const co = Math.cos(rad);
        const si = Math.sin(rad);
        const vx = this.x; const vy = this.y;
        this.x = vx * co - vy * si;
        this.y = vx * si + vy * co;
    }
    //0 is (1, 0) vector, facing right
    static fromAngle(rad:number):Vector2D{
        //const y = Math.cos(rad);
        //const x = Math.sin(rad);
        const x = Math.cos(rad);
        const y = Math.sin(rad);
        return new Vector2D(x, y);
    }
    toRotation():Rotation{
        if(this.y !== 0){
            const rot = this.y < 0 ? Math.atan(-this.x/this.y)+Math.PI+Math.PI/2 : Math.atan(-this.x/this.y)+Math.PI/2;
            return new Rotation(rot);
        }
        return new Rotation();
    }
    arr(){
        return [this.x, this.y];
    }
}


//value between 0 and 2*PI
//0 starts facing right
export class Rotation{
    static twoPi = 2*Math.PI;
    rot:number;
    constructor(rot?:number){

        this.rot = rot === undefined ? 0 : rot % Rotation.twoPi;
        if(this.rot < 0) this.rot += Rotation.twoPi;
    }
    set(r:number){
        this.rot = r % Rotation.twoPi;
        if(this.rot < 0) this.rot += Rotation.twoPi;
    }
    add(r:number){
        if(r < 0){
            this.sub(-r);
        }else{
            this.rot += r;
            if(this.rot > Rotation.twoPi){
                this.rot -= Rotation.twoPi;
            }
        }
    }
    sub(r:number){
        if(r < 0){
            this.add(-r)
        }else{
            this.rot -= r;
            if(this.rot < 0){
                this.rot += Rotation.twoPi;
            }
        }
    }
    diff(rot:Rotation){
        const rots = this.rot > rot.rot ? [rot.rot, this.rot] : [this.rot, rot.rot];
        const d1 = rots[1] - rots[0];
        const d2 = Rotation.twoPi - rots[1] + rots[0];
        return Math.min(d1, d2);
    }
    //true clockwise, false anti-clockwise
    closer(rot:Rotation):boolean{
        if(this.rot > rot.rot){
            const rots = [rot.rot, this.rot];
            const d1 = rots[1] - rots[0]; // anticlockwise
            const d2 = Rotation.twoPi - rots[1] + rots[0];
            return (d1 > d2);
        }else{
            const rots = [this.rot, rot.rot];
            const d1 = rots[1] - rots[0]; //clockwise
            const d2 = Rotation.twoPi - rots[1] + rots[0]; 
            return (d1 < d2);
        }
    }
    ////true clockwise, false anti-clockwise
    diffDirection(rot:Rotation):{difference: number; clockwise: boolean;}{
        const ret = {difference: 0, clockwise: true};
        if(this.rot > rot.rot){
            const rots = [rot.rot, this.rot];
            const d1 = rots[1] - rots[0]; // anticlockwise
            const d2 = Rotation.twoPi - rots[1] + rots[0];
            if(d1 > d2){
                ret.difference = d2;
                ret.clockwise = true;
            }else{
                ret.difference = d1;
                ret.clockwise = false;
            }
        }else{
            const rots = [this.rot, rot.rot];
            const d1 = rots[1] - rots[0]; //clockwise
            const d2 = Rotation.twoPi - rots[1] + rots[0]; 
            if(d1 < d2){
                ret.difference = d1;
                ret.clockwise = true;
            }else{
                ret.difference = d2;
                ret.clockwise = false;
            }
        }
        return ret;
    }
    static fromVector(vec:Vector2D):Rotation{
        if(vec.y !== 0){
            const rot = vec.y < 0 ? Math.atan(-vec.x/vec.y)+Math.PI+Math.PI/2 : Math.atan(-vec.x/vec.y)+Math.PI/2;
            return new Rotation(rot);
        }
        return new Rotation();
    }
    toVector():Vector2D{
        return Vector2D.fromAngle(this.rot);
    }
}