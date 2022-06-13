import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import img from './63330562520__C0FD7A92-2F19-4B97-8A30-1394EE3C2322.jpg'



function App() {
  function clickFun(event) {
    const target = event.target;
    const boundingRect = target.getBoundingClientRect();
    // const x = (event.pageX - boundingRect.left)/(boundingRect.width*window.devicePixelRatio);
    // const y = (event.pageY - boundingRect.top)/(boundingRect.height*window.devicePixelRatio);
    const x = (event.pageX - boundingRect.left - window.scrollX)/(boundingRect.width);
    const y = (event.pageY - boundingRect.top - window.scrollY)/ (boundingRect.height);
    setxy({x: x, y: y});
    setMousexy({x: event.pageX-200*(2*x-1)+100, y: event.pageY-30*(2*y-1)+20});


    if (x > .87 && x < .94 && y > .20 && y < .33) {
      setFound(true);
    } else {
      setFound(false);
    }
  
  }
  const [xy, setxy] = useState({x: 0, y: 0});
  const [mousexy, setMousexy] = useState({x: 0, y: 0});
  const [found, setFound] = useState(false);
  const divStyle = {
    top: mousexy.y-30,
    left: mousexy.x-200
  }


  return (
    <div className="App">
      <img src={img}  onMouseMove={clickFun} className="App-header">
      </img>
      <div className='text' style={divStyle}>{String(found) + ":" + String((xy.x*100).toFixed(2)) + "   " + String((xy.y*100).toFixed(2))}</div>
    </div>
  );
}

export default App;

