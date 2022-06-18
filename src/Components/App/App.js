import '../../Styles/App.css';
import { useState, useEffect } from 'react';
import firebaseConfig from '../../firebaseConfig';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { getFunctions, httpsCallable } from 'firebase/functions';
import SelectionBox from '../SelectionBox/SelectionBox';
import Header from '../Header/Header';
import ThingsSidebar from '../ThingsSidebar/ThingsSidebar';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const checkerFunction = httpsCallable(functions, 'helloWorld');

function App() {

  const [img, setImg] = useState("");
  const [xy, setxy] = useState({ x: 0, y: 0 });
  const [boxLoc, setBoxLoc] = useState({ top: 0, left: 0 });
  const [gameParams, setGameParams] = useState({ gameOn: false, time: 0 });
  const [things, setThings] = useState([]);
  const [foundThings, setFoundThings] = useState([]);
  const [boxOpen, setBoxOpen] = useState(false);
  const [imagesOpen, setImagesOpen] = useState(false);
  const [thingsOpen, setThingsOpen] = useState(false);

  function openMenu(event) {
    if (gameParams.gameOn) {
      setBoxOpen(true);
      const target = event.target;
      const boundingRect = target.getBoundingClientRect();
      const x = (event.pageX - boundingRect.left - window.scrollX) / (boundingRect.width);
      const y = (event.pageY - boundingRect.top - window.scrollY) / (boundingRect.height);
      setxy({ x: x, y: y });
      const longestThing = things.reduce((prev, curr) => curr.length > prev.length ? curr : prev)
      let sideFactor = 10;
      if (x * boundingRect.width > boundingRect.width - longestThing.length * 10) {
        sideFactor = -(longestThing.length * 10 + 20)
      }
      setBoxLoc({ left: event.pageX + sideFactor, top: event.pageY });
    }
  }

  function mouseMove(event) {
    const FENCE_RADIUS = .2;
    const target = event.target;
    const boundingRect = target.getBoundingClientRect();
    const x = (event.pageX - boundingRect.left - window.scrollX) / (boundingRect.width);
    const y = (event.pageY - boundingRect.top - window.scrollY) / (boundingRect.height);
    if (Math.sqrt((x - xy.x) ** 2 + (y - xy.y) ** 2) > FENCE_RADIUS && target.parentElement !== document.getElementById("selectionBox")) {
      setBoxOpen(false);
    }

  }

  async function checkGuess(event) {
    const name = event.target.dataset.name;
    if (!foundThings.includes(name)) {
      const result = await checkerFunction({ "thing": name, "x": xy.x, "y": xy.y });
      if (result.data.found) {
        setFoundThings((prevState => {
          let foundThings = [...prevState, name];
          if (foundThings.length === things.length) {
            setBoxOpen(false);
            alert(`You found all the things in ${(Date.now() - gameParams.time) / 1000} seconds`);
            foundThings = [];
            endGame();
          }
          return foundThings
        }))
      }
      setBoxOpen(false);
    }
  }

  useEffect(() => { getData() }, []);

  async function getData() {
    const docRef = doc(db, "Imgs", "Img");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setThings(data.things.map((thing) => thing.name));
      const url = await getDownloadURL(ref(storage, data.URLPath));
      preloadImage(url);
      setImg(url);
    }
  }

  function startGame() {
    setGameParams({ gameOn: true, time: Date.now() });
  }

  function endGame() {
    setGameParams((prevState) => ({ gameOn: false, time: Date.now() - prevState.time }));
  }

  function preloadImage(url) {
    var img = new Image();
    img.src = url;
  }

  function toggleImages() {
    setImagesOpen((prevState => !prevState));
  }

  function toggleThings() {
    setThingsOpen((prevState => !prevState));
  }

  return (
    <div className="App">
      <Header imagesOpen={imagesOpen} thingsOpen={thingsOpen} toggleImages={toggleImages} toggleThings={toggleThings} />
      <div id="imgContainer"><img src={img} alt="game" onClick={openMenu} onMouseMove={mouseMove} className={gameParams.gameOn ? "App-header" : "App-header blur"} /></div>
      {boxOpen && <SelectionBox loc={boxLoc} things={things} foundThings={foundThings} checkGuess={checkGuess} />}
      {thingsOpen && <ThingsSidebar things={things} foundThings={foundThings} startGame={startGame} gameParams={gameParams} />}
    </div>
  );
}


export default App;


