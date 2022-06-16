import './App.css';
import { useState } from 'react';
// import img from './63330562520__C0FD7A92-2F19-4B97-8A30-1394EE3C2322.jpg'
import firebaseConfig from './firebaseConfig';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { getFunctions, httpsCallable } from 'firebase/functions';
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const checkerFunction = httpsCallable(functions, 'helloWorld');



function App() {
  async function clickFun(event){
    const target = event.target;
    const boundingRect = target.getBoundingClientRect();
    const x = (event.pageX - boundingRect.left - window.scrollX)/(boundingRect.width);
    const y = (event.pageY - boundingRect.top - window.scrollY)/ (boundingRect.height);
    const result = await checkerFunction({"thing":"light", "x":x , "y": y});
    if (result.data.found){
      triggerTimer();
    }
    
    console.log(result.data.found);
  }
  function moveFun(event) {
    const target = event.target;
    const boundingRect = target.getBoundingClientRect();
    const x = (event.pageX - boundingRect.left - window.scrollX)/(boundingRect.width);
    const y = (event.pageY - boundingRect.top - window.scrollY)/ (boundingRect.height);
    setxy({x: x, y: y});
    setMousexy({x: event.pageX-100*(2*x-1)+150, y: event.pageY-30*(2*y-1)+20});
    if (x > .87 && x < .94 && y > .20 && y < .33) {
      setFound(true);
    } else {
      setFound(false);
    }
  }
  getData();
  async function getData() {
    const docRef = doc(db, "Imgs", "Img");
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const data = docSnap.data();
      const url = await getDownloadURL(ref(storage, data.URLPath ));
      setImg(url);
    } else {
    }
    
  }
  
  const [img, setImg] = useState("");
  const [xy, setxy] = useState({x: 0, y: 0});
  const [mousexy, setMousexy] = useState({x: 0, y: 0});
  const [found, setFound] = useState(false);
  const [time, setTime] = useState({timerOn: false, time: 0});
  const divStyle = {
    top: mousexy.y-30,
    left: mousexy.x-200
  }

  function triggerTimer() {
    if (!time.timerOn) {
      setTime({timerOn: true, time:Date.now()});
    } else {
      setTime((prevState) =>  ({timerOn: false, time:Date.now() - prevState.time }));
    }
  }
  return (
    <div className="App">
      <button onClick={triggerTimer}>{time.time}</button>
      <img src={img}  onMouseMove={moveFun} onClick={clickFun} className="App-header">
      </img>
      <div className='text' style={divStyle}>{String(found) + ":" + String((xy.x*100).toFixed(2)) + "   " + String((xy.y*100).toFixed(2))}</div>
    </div>
  );
}


export default App;


