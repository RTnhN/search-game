import React, { useState } from "react";

function GameStatusBar(props) {
const [helpOpen, setHelpOpen] = useState(false);
const time = new Date(props.gameParams.time).toISOString().substring(14,21);
const timeStyle = (props.gameParams.gameFinished) ? "finishedTimer" : "normalTimer";
let buttonText;
if (!props.gameParams.gameOn && !props.gameParams.gameFinished){
  buttonText = "Start";
} else if (props.gameParams.gameOn && !props.gameParams.gameFinished){
  buttonText = "Reset";
} else if (!props.gameParams.gameOn && props.gameParams.gameFinished){
  buttonText = "Reset";
} else {
  alert("there tis a bug");
}

return (
  <div id="gameStatusBar">
    <div id="gameStatusBarContainer">
      <button id="helpButton" className='material-symbols-outlined' onClick={()=>setHelpOpen(prevState => !prevState)}>info</button>
      {helpOpen && <div id="helpText"><span>Help</span> <br/> <hr/> Find all the things in the picture by clicking on the thing and selecting it in the menu. Try to be fast since it is timed.</div>}
      <button id= "mainButton" data-state={buttonText} onClick={props.handleMainButtonClick}>{buttonText}</button>
      <p id="timer" className={timeStyle}>{time}</p>
      <input type="text" value={props.name} onChange={props.updateName} />
      <button onClick={props.saveTime}>Save Time</button>
    </div>
  </div>
);
}

export default GameStatusBar;
