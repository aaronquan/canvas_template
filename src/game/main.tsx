import { CanvasScreenManager } from "../Canvas/Screen";
import { GameCanvas, GameGrid } from "./game";
import { GameMenu } from "./menu";


export class GameMain extends CanvasScreenManager{
    game: GameCanvas;
    menu: GameMenu;
    constructor(){
        super();
        this.currentScreen = 0;
        this.game = new GameCanvas();
        this.menu = new GameMenu();

        this.menu.onClickPlay = () => {
            this.changeScreen(0);
            this.game.gameGrid = new GameGrid();
            this.game.gameGrid.resize(this.width, this.height);
        }

        this.game.onClickQuit = () => {
            this.changeScreen(1);
        }

        this.addScreen(this.game);
        this.addScreen(this.menu);
    }
    update(time:number){
        if(this.currentScreen == 0) this.game.update(time);
        else this.menu.update(time);
    }
    //resize(winX: number, winY: number): void {
    //    this.width = winX; this.height = winY;
    //}
}