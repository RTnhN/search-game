import React , { useState }from "react";
import { nanoid } from "nanoid";

function ThingsSidebar(props) {
  const [thingsWindowType, setThingsWindowType] = useState("things");
  function changeWindow(event){
    const type = event.target.id;
    setThingsWindowType(type.split("Button")[0]);
  }  

  function secToFormatTime(sec){
    return new Date(sec).toISOString().substring(14,21);

  }

  return (
    <div id="thingsSidebar">
      <div id="thingsSidebarButtons">
        <button id="thingsButton" className={thingsWindowType ==="things" ? "active" : ""} onClick={changeWindow}>Things</button>
        <button id="winnersButton" className={thingsWindowType ==="winners" ? "active" : ""} onClick={changeWindow}>Winners</button>
      </div>
      <div id="thingsSidebarContainer">
        { thingsWindowType === "things" &&
        props.things.map((thing) => {
          if (props.foundThings.includes(thing)) {
            return <p key={thing} className="found">{thing}</p>;
          } else {
            return <p key={thing} className={props.className}>{thing}</p>;
          }
        })
        }
        {thingsWindowType === "winners" && <div id="winnerTitle"><span>Name</span><span>Time</span></div>}
        { thingsWindowType === "winners" &&
        props.winners.sort((a,b)=>a.time-b.time).map((winner) => {
          return <p className ="winner" key={nanoid()}><span className="winnerName">{winner.name}</span><span className="winnerTime">{secToFormatTime(winner.time)}</span></p>;
        }
        )}
      </div>
    </div>
  );
}
export default ThingsSidebar;