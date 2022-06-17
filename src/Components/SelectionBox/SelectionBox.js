import { nanoid } from "nanoid"
import React from "react"

function SelectionBox(props){
  return(
    <div id="selectionBox" style={props.loc}>
      {props.things.map((thing) => {
        if (props.foundThings.includes(thing)){
          return <button key={nanoid()} className="found" data-name ={thing} onClick={props.checkGuess} >{thing}</button>
        } else {
          return <button key={nanoid()} data-name ={thing} onClick={props.checkGuess} >{thing}</button>
        }
      })}

    </div>
  )
}

export default SelectionBox;