import React from "react";
import "../../Styles/Header.css";

function Header(props) {
  return (
    <header id="header">
      <button onClick={props.openImages}>{props.imagesOpen ? "Hide images" : "Show images"}</button>
      <h1 id="title">Search Game</h1>
      <button onClick={props.openThings}>{props.thingsOpen ? "Hide things" : "Show things"}</button>
    </header>
    )
}

export default Header;