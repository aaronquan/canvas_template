import { ABlock, StoneBlock, WoodBlock, FloatBlock, SprinkleBlock } from '../game/blocks';
import testTexture from './../assets/testblock.png';
import woody from './../assets/wood.png';
import a from './../assets/W.png';
import fl from './../assets/Floater.png';
import sprink from './../assets/sprinkle.png';

type TextureLink = {
    
}

const types = [StoneBlock];

export function loadTexturesIntoGame(cr:CanvasRenderingContext2D){
    loadTexture(StoneBlock, testTexture, cr);
    loadTexture(WoodBlock, woody, cr);
    loadTexture(SprinkleBlock, sprink, cr);
    loadTexture(ABlock, a, cr);
    loadTexture(FloatBlock, fl, cr);
}


function loadTexture(type:any, textureUrl: string, cr:CanvasRenderingContext2D){
    const img = new Image();
    img.src = textureUrl;
    img.onload = () => {
        console.log('loaded')
        const pattern = cr.createPattern(img, 'repeat');
        if(pattern) type.colour = pattern;
    }
}