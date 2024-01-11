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
import { GameMain } from './game/main';
import { BlockElement, StoneBlock } from './game/blocks';

import testTexture from './assets/testblock.png'
import { loadTexturesIntoGame } from './graphics/loadTextures';

function App() {
  const game = useRef<GameMain>();
  //const [context, setContext] = useState<CanvasRenderingContext2D>();
  const contextRef = useRef<CanvasRenderingContext2D>();
  const mouse = useRef<MouseState>(new MouseState());
  useKeys(handleKeyDown, handleKeyUp);

  const windowSize = useRef<WindowSize>();
  //const rawMouse = useMousePosition();

  useEffect(() => {
      game.current = new GameMain();
      if(windowSize.current) game.current.resize?.(windowSize.current.width, windowSize.current.height);
      //mouse.current = new MouseState();
  }, []);

  useEffect(() => {
    if(contextRef.current){
      const cr = contextRef.current;

      game.current = new GameMain();
      if(windowSize.current) game.current.resize?.(windowSize.current.width, windowSize.current.height);

      loadTexturesIntoGame(cr);
    }
  }, [contextRef]);
  
  function handleResize(size:WindowSize){
    windowSize.current = size;
    if(game.current) game.current.resize(size.width, size.height);
  }
  function animationStep(cr:CanvasRenderingContext2D, time: number, inputChanges: InputChanges, animTime:AnimTime){
    if(windowSize.current) cr.clearRect(0, 0, windowSize.current.width, windowSize.current.height);
    if(game.current){
      game.current.draw(cr);
      game.current.update(animTime.frameTime);
    }
  }
  function handleMouseMove(e:React.MouseEvent<HTMLCanvasElement>, 
    canvas:HTMLCanvasElement):void{
      if(game.current && mouse.current) game.current.mouseMove(e, mouse.current.position);
  }
  function handleLeftMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
    if(game.current && mouse.current) game.current.mouseLeftDown(e, mouse.current.position);
  }
  function handleLeftMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
    if(game.current && mouse.current) game.current.mouseLeftUp(e, mouse.current.position);
  }
  function handleRightMouseDown(e:React.MouseEvent<HTMLCanvasElement>){
    if(game.current && mouse.current) game.current.mouseRightDown(e, mouse.current.position);
  }
  function handleRightMouseUp(e:React.MouseEvent<HTMLCanvasElement>){
    if(game.current && mouse.current) game.current.mouseRightUp(e, mouse.current.position);
  }
  function handleKeyDown(e:KeyboardEvent){
    if(game.current) game.current.keyDown(e, e.key);
  }
  function handleKeyUp(e:KeyboardEvent){
    if(game.current) game.current.keyUp(e, e.key);
  }
  function handleInitCanvas(cr:CanvasRenderingContext2D){
    contextRef.current = cr;
  }
  return (
    <>
      {/*<Cursor mouse={rawMouse}/>*/}
      <CanvasApp onInit={handleInitCanvas} onResize={handleResize} fullScreen
      hideMouse={true} onMouseMove={handleMouseMove} onLeftMouseDown={handleLeftMouseDown}
      onLeftMouseUp={handleLeftMouseUp} onRightMouseDown={handleRightMouseDown}
      onRightMouseUp={handleRightMouseUp}
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
