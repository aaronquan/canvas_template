import { useState, useEffect, useRef } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import { CanvasApp, WindowSize } from './Canvas/Canvas'
import { InputChanges, MouseState } from './input/mouse';
import { useMouseMove, useMousePosition, useMouseRefPosition } from './hooks/Mouse';
import { Point } from './geometry/geometry';
import { AnimTime } from './time/time';
import { GameGrid } from './game/game';
import { useKeys } from './input/keys';

function App() {
  const game = useRef<GameGrid>();
  //const [context, setContext] = useState<CanvasRenderingContext2D>();
  const contextRef = useRef<CanvasRenderingContext2D>();
  const mouse = useRef<MouseState>(new MouseState());
  useKeys(handleKeyDown);

  const windowSize = useRef<WindowSize>();
  //const rawMouse = useMousePosition();

  useEffect(() => {
      game.current = new GameGrid();
      //mouse.current = new MouseState();
  }, []);

  useEffect(() => {
    if(contextRef.current){
      const cr = contextRef.current;
      const img = new Image();
      img.src = '/src/assets/react.svg';
      img.onload = () => {
        console.log('loaded')
        const pattern = cr.createPattern(img, 'repeat');
        if(game.current) game.current.testTexture = pattern;
      }
    }
  }, [contextRef]);
  
  function handleResize(size:WindowSize){
    windowSize.current = size;
    //contextRef.current?.clearRect(0, 0, size.width, size.height);
    //if(contextRef.current) drawPicture(contextRef.current);
  }
  function animationStep(cr:CanvasRenderingContext2D, time: number, inputChanges: InputChanges, animTime:AnimTime){
    if(windowSize.current) cr.clearRect(0, 0, windowSize.current.width, windowSize.current.height);
    if(game.current){
      game.current.draw(cr);
      //drawCursor(cr);
      //console.log(rawMouse);
      game.current.update(animTime.frameTime);
    }
  }
  function handleMouseMove(e:React.MouseEvent<HTMLCanvasElement>, 
    canvas:HTMLCanvasElement):void{
      if(game.current && mouse.current) game.current.mouseMove(e, mouse.current.position);
  }
  function handleKeyDown(e:KeyboardEvent){
    if(game.current) game.current.keyDown(e, e.key);
  }
  function handleInitCanvas(cr:CanvasRenderingContext2D){
    contextRef.current = cr;
  }
  return (
    <>
      {/*<Cursor mouse={rawMouse}/>*/}
      <CanvasApp onInit={handleInitCanvas} onResize={handleResize} fullScreen
      hideMouse={true} onMouseMove={handleMouseMove}
      animationStep={animationStep} mouseState={mouse.current}/>
    </>
  )
}

function Cursor(props:{mouse:Point}){
  return <div style={{
    cursor: 'none',
    position:'fixed', 
    backgroundColor: 'red', top:props.mouse.y,
    left: props.mouse.x, width: '20px', height: '20px'
  }}/>
}

export default App;
