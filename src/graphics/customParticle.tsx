import { BlockElement } from "../game/blocks";
import { Point, Vector2D } from "../geometry/geometry";
import { DrawGrid2D } from "../geometry/grid";
import { getRandomInteger, getRandomRanges } from "../math/Random";
import { GravityParticleEffect } from "./particle";



export namespace BlockParticles{

    export function gridDroppingSquare(x:number, y: number, 
        grid:DrawGrid2D<BlockElement>, colour:string | CanvasPattern ='green'):GravityParticleEffect{
        const position = grid.getGridPosition(x, y);
        const randX = getRandomInteger(grid.gridSize);
        const randY = getRandomInteger(grid.gridSize);
        const particlePosition = new Point(position.x+randX, position.y+randY);
        const angle = getRandomRanges(Math.PI, Math.PI+Math.PI);
        const vec = Vector2D.fromAngle(angle);
        
        const particle = new GravityParticleEffect(particlePosition, vec);
        particle.colour = colour;
        vec.multi(150);
        return particle;
    }

}