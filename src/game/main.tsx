import { CanvasScreenManager } from "../Canvas/Screen";
import { GameCanvas } from "./game";


export class GameMain extends CanvasScreenManager{
    game: GameCanvas;
    constructor(){
        super();
        this.currentScreen = 0;
        this.game = new GameCanvas();
        this.addScreen(this.game);
    }
    update(time:number){
        this.game.update(time);
    }
}