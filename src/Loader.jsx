import React from "react";
import { SyncLoader } from "react-spinners";

export default function Loader({ 
  size = 15, 
  color = "#a30e46", 
  margin = 4, 
  speedMultiplier = 1,
  className = "" 
}) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <SyncLoader
        color={color}
        size={size}
        margin={margin}
        speedMultiplier={speedMultiplier}
      />
    </div>
  );
} 