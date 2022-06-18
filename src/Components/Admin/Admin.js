import React from "react";
import { useState } from "react";
import "../../Styles/Admin.css";


function Admin(props) {
  const [image, setImage] = useState(null)
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [imgName, setImgName] = useState("");
  const [thingList, setThingList] = useState([]);

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  }

  function dragStart(e) {
    e.preventDefault();
  }

  function mouseDown(event) {
    if (imgName !== "") {
      const target = event.target;
      const boundingRect = target.getBoundingClientRect();
      const x = (event.pageX - boundingRect.left - window.scrollX) / (boundingRect.width);
      const y = (event.pageY - boundingRect.top - window.scrollY) / (boundingRect.height);
      setStart({ x: x, y: y });
    }
  }

  function mouseUp(event) {
    if (imgName !== "") {
      const target = event.target;
      const boundingRect = target.getBoundingClientRect();
      const x = (event.pageX - boundingRect.left - window.scrollX) / (boundingRect.width);
      const y = (event.pageY - boundingRect.top - window.scrollY) / (boundingRect.height);
      console.log(start);
      console.log({ x: x, y: y });
      setThingList((prevState) => {
        let thingList = [...prevState, { name: imgName, coords:{ x1: start.x, y1: start.y, x2: x, y2: y}}];
        return thingList
      })
      setImgName("");
    }
  }

  function updateName(event) {
    setImgName(event.target.value);
  }

  return (
    <div id="admin">
      <input type="text" value={imgName} onChange={updateName}/>
      <input type="file" onChange={onImageChange} className="filetype" />
      <img src={image} alt="preview" onDragStart={dragStart} onMouseDown={mouseDown} onMouseUp={mouseUp} />
      <p>{"{\"things\":"+JSON.stringify(thingList)+ "}"}</p>
    </div>
  )

}

export default Admin;