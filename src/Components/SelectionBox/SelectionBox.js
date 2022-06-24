import { nanoid } from "nanoid"
import React from "react"

function SelectionBox(props){

  const angleFactor = (normedIndex) => ((props.boxParams.maxAngle - props.boxParams.minAngle) * normedIndex + props.boxParams.minAngle)
  const endFactor = (props.boxParams.minAngle%360 === props.boxParams.maxAngle%360) ? 0 : 1;
  return(
    <div id="selectionBox" style={props.boxParams.loc}>
      <p>+</p>
      {props.remainingThings.map((thing, index) => {
          const angle = angleFactor(index/(props.remainingThings.length-endFactor));
          return <button key={nanoid()} data-name ={thing} style={{"--angle":`${angle}deg`}} onClick={props.checkGuess}>{thing}</button>
        }
      )}
    </div>
  )
}

export default SelectionBox;