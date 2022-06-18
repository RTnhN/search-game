import React from "react";
import { nanoid } from "nanoid";

function ImagesSidebar(props) { 
  return (
    <div id="imagesSidebar">
      <h2>Images</h2>
      <ul>
        {props.images.map((image) => {
          return (
            <li key={nanoid()}>
              <button data-name={image} onClick={props.loadImage}>{image}</button> 
            </li>
          );
        }
        )}
      </ul>
    </div>
  )
}

export default ImagesSidebar;