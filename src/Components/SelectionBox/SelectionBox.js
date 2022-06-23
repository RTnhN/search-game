import { nanoid } from "nanoid"
import React from "react"

function SelectionBox(props){
  return(
    <div id="selectionBox" style={props.loc}>
      {props.remainingThings.map((thing, index) => {
          return <button key={nanoid()} data-name ={thing} style={{"--angle":`${index/props.remainingThings.length*360}deg`}} onClick={props.checkGuess} >{thing}</button>
        }
      )}
    </div>
  )
}

export default SelectionBox;