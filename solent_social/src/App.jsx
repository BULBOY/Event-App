import { useState } from 'react';
import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import SignIn from '../components/auth/SignIn';
import Home from '../components/Home';
import 'bootstrap/dist/css/bootstrap.css';
import SignUp from '../components/auth/SignUp';


function App() {

  return (
    <>
   
    <BrowserRouter future={{
        v7_startTransition: true, v7_relativeSplatPath: true
        }}>
      <Routes>
        <Route path='/' exact Component={Home}/>   
        <Route path='/signin' exact Component={SignIn} />
        <Route path='/signup' exact Component={SignUp} />
      </Routes>
    </BrowserRouter>

    </>
  )
}

export default App
