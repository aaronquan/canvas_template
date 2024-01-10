import { Point, Vector2D } from "../geometry/geometry";

//basic square particle effect

export class ParticleEngine{
    particles: ParticleEffect[];
    constructor(){
        this.particles = [];
    }
    //takes in time in miliseconds
    update(time: number){
        const secs = time/1000;
        //remove any expired particles
        this.removeExpiredParticles();

        //update particles
        for(const particle of this.particles){
            particle.update(secs);
        }
    }
    removeExpiredParticles(){
        for(let i = this.particles.length - 1; i >= 0; --i){
            const particle = this.particles[i];
            if(particle.currentDuration > particle.maxDuration){
                this.particles.splice(i, 1);
            }
        }
    }
    addParticle(p:ParticleEffect){
        this.particles.push(p);
    }
    addParticles(p:ParticleEffect[]){
        this.particles.push(...p);
    }
    draw(cr:CanvasRenderingContext2D){
        for(const particle of this.particles){
            particle.draw(cr);
        }
    }
}

export class ParticleEffect{
    position: Point;
    velocity: Vector2D;
    colour: string;
    size: number;

    maxDuration: number; //durations in seconds
    currentDuration: number;

    constructor(p?: Point, v?:Vector2D){
        this.position = p ? p : new Point();
        this.velocity = v ? v : new Vector2D();
        this.size = 10;
        this.currentDuration = 0;
        this.maxDuration = 5;
    }
    move(secs:number){
        //const t = time / 1000;
        const moveVel = this.velocity.copy();
        moveVel.multi(secs);
        this.position.addVector(moveVel);
        this.currentDuration += secs;
    }
    update(secs:number){
        this.move(secs);
    }
    isInScreen(){
        
    }
    draw(cr:CanvasRenderingContext2D){
        cr.fillStyle = this.colour;
        const halfSize = this.size / 5;
        cr.fillRect(this.position.x-halfSize, this.position.y - halfSize, this.size, this.size);
    }
}

export class GravityParticleEffect extends ParticleEffect{
    static gravity: number = 6;
    constructor(p?: Point, v?:Vector2D){
        super(p, v);
    }
    update(secs:number){
        this.move(secs);
        this.velocity.y += GravityParticleEffect.gravity;
    }
}