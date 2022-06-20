import React from "react";

function ThingsSidebar(props) {
  return (
    <div id="thingsSidebar">
      <button>Things</button>
      <button>Winners</button>
      <div id="things">
        {props.things.map((thing) => {
          if (props.foundThings.includes(thing)) {
            return <p key={thing} className="found">{thing}</p>;
          } else {
            return <p key={thing} className={props.className}>{thing}</p>;
          }
        }
        )}
      </div>
    </div>
  );
}
export default ThingsSidebar;