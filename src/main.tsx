import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

//for routing, but does not work with github pages
/*
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom"

import TestApp from './Apps/test.tsx'
import TestCanvas from './Apps/testCanvas.tsx'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>
  },
  {
    path: '/test',
    element: <TestApp/>
  },
  {
    path: '/canvasTest',
    element: <TestCanvas/>
  }
]);
*/

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/*<RouterProvider router={router} />*/}
    <App/>
  </React.StrictMode>,
)
