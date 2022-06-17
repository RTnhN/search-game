import React from "react";

function Header(props) {
  return (
    <header id="header">
      <button onClick={props.toggleImages}>{props.imagesOpen ? "Hide images" : "Show images"}</button>
      <h1 id="title">Search Game</h1>
      <button onClick={props.toggleThings}>{props.thingsOpen ? "Hide things" : "Show things"}</button>
    </header>
    )
}

export default Header;