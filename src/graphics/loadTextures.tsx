import { StoneBlock } from '../game/blocks';
import testTexture from './../assets/testblock.png'

type TextureLink = {
    
}

const types = [StoneBlock];

export function loadTexturesIntoGame(cr:CanvasRenderingContext2D){
    loadTexture(StoneBlock, testTexture, cr);
}


function loadTexture(type:any, textureUrl: string, cr:CanvasRenderingContext2D){
    const img = new Image();
    img.src = textureUrl;
    img.onload = () => {
        console.log('loaded')
        const pattern = cr.createPattern(img, 'repeat');
        if(pattern) StoneBlock.colour = pattern;
    }
}