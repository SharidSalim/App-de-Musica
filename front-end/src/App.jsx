// src/components/CreateRoomButton.js
import React, { useState } from "react";
import axios from "axios"

import { useNavigate } from "react-router";

const App = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("")
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <button
        onClick={async () => {
          const res = await axios.post("http://localhost:3001/create-room");
      
          navigate(`/room/${res.data.roomId}`);
      
        }}
      >
        Create Room
      </button>
      <input type="text" onChange={(e)=>{
        setCode(e.target.value)
      }} />
      <button className="mt-4" onClick={async ()=>{
        const res = await axios.get(`http://localhost:3001/rooms/${code}`)
        
        if(res.data !==""){
          navigate('/room/'+code)
        } else {
          console.log("server doesn't exist");
          
        }
        
        // if( res.data.some((data)=>
             
          
        //   String(data.roomId) === String(code)
        // )) {
        //   navigate('/room/'+code)
        // } else{
        //   console.log('ROOM DOESNT EXIST');          
        // }

        
      }}>
        Join Room
      </button>
    </div>
  );
};

export default App;
