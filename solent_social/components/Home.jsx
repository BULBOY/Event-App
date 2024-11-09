import React, { Component } from "react";
import { Link } from "react-router-dom";
import MapComponent from "./MapComponent";
import 'leaflet/dist/leaflet.css';


class Home extends Component {
    state = {}
    render() {
        return ( 
        <>
        <div className="mb-3">
       
        <header style={{backgroundColor:'Tomato'}}>
        <h1 style={{textAlign:'center', color:'black'}}>WELCOME TO <span style={{color:"red"}}>SOLENT</span> MEETUPS AND SOCIAL EVENTS</h1>   
         <nav style={{backgroundColor:'black', textAlign:'right',textJustify:'auto'}}>
            <Link to='/signin' style={{marginRight:'1%'}}>Sign In</Link>
            <Link to='/signup' style={{marginRight:'1%'}}>Sign Up</Link>
            </nav> 
         </header>         
         </div>
         <div style={{alignItems:'center', display:'flex', justifyContent:'center'}}>
            <label htmlFor='events'>Event type  </label>
            <br />
            <input id="events" />
            <input type="button" value="Search" onClick={{}} />
                  
         </div>
         <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                height: "75vh" // Full viewport height for centering vertically
            }}>
            <MapComponent />
         </div>
         
         
        </>);
    }
}

export default Home;