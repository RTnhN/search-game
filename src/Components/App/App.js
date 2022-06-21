import '../../Styles/App.css';
import { useState, useEffect } from 'react';
import firebaseConfig from '../../firebaseConfig';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, arrayUnion, doc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { getFunctions, httpsCallable } from 'firebase/functions';
import SelectionBox from '../SelectionBox/SelectionBox';
import Header from '../Header/Header';
import ThingsSidebar from '../ThingsSidebar/ThingsSidebar';
import ImagesSidebar from '../ImagesSidebar/ImagesSidebar';
import GameStatusBar from '../GameStatusBar/GameStatusBar';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const checkerFunction = httpsCallable(functions, 'helloWorld');

function App() {

  const [img, setImg] = useState("");
  const [xy, setxy] = useState({ x: 0, y: 0 });
  const [screenxy, setScreenxy] = useState({ x: 0, y: 0 });
  const [boxLoc, setBoxLoc] = useState({ top: 0, left: 0 });
  const [gameParams, setGameParams] = useState({ gameOn: false, startTime: 0, time: 0, gameFinished: false });
  const [things, setThings] = useState([]);
  const [foundThings, setFoundThings] = useState([]);
  const [foundThingsPointList, setFoundThingsPointList] = useState([]);
  const [boxOpen, setBoxOpen] = useState(false);
  const [imagesOpen, setImagesOpen] = useState(false);
  const [thingsOpen, setThingsOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [name, setName] = useState("Enter Name Here");
  const [intervalRef, setIntervalRef] = useState(null);
  const [docsSnapshot, setDocsSnapshot] = useState(null);
  const [selectedImageWinners, setSelectedImageWinners] = useState([]);

  function openMenu(event) {
    if (gameParams.gameOn) {
      setBoxOpen(true);
      const target = event.target;
      const boundingRect = target.getBoundingClientRect();
      const x = (event.pageX - boundingRect.left - window.scrollX) / (boundingRect.width);
      const y = (event.pageY - boundingRect.top - window.scrollY) / (boundingRect.height);
      setxy({ x: x, y: y });
      setScreenxy({ x: event.pageX, y: event.pageY });
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
      const result = await checkerFunction({ "thing": name, "x": xy.x, "y": xy.y, "img": selectedImage });
      setBoxOpen(false);
      if (result.data.found) {
        setFoundThings((prevState => {
          let foundThings = [...prevState, name];
          if (foundThings.every(thing => things.includes(thing)) && foundThings.length >= things.length) {
            endGame();
          }
          return foundThings
        }))
        setFoundThingsPointList(prevState => [...prevState, screenxy]);
      }
      setBoxOpen(false);
    }
  }
  // eslint-disable-next-line
  useEffect(() => { getImgNames(); }, []);

  async function loadImage(event) {
    const imgName = event.target.dataset.name;
    setSelectedImage(imgName);
    const docSnap = docsSnapshot.docs.find(doc => doc.id === imgName);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const url = await getDownloadURL(ref(storage, data.URLPath));
      setImg(url);
      setThings(data.things.map(thing => thing.name));
      setSelectedImageWinners(data.winners === undefined ? [] : data.winners);
    }
    setFoundThingsPointList([]);
    setFoundThings([]);
    setGameParams({ startTime: 0, gameOn: false, time: 0, gameFinished: false });
  }

  async function getImgNames() {
    const collectionRef = collection(db, "Imgs");
    const docsSnap = await getDocs(collectionRef);
    setDocsSnapshot(docsSnap);
    const images = docsSnap.docs.map(img => img.id);
    setImages(images);
    docsSnap.docs.forEach(async (img) => {
      const url = await getDownloadURL(ref(storage, img.data().URLPath));
      preloadImage(url)
    })
  }

  function handleMainButtonClick(event) {
    const action = event.target.dataset.state;
    if (action === "Start") {
      startGame();
    } else if (action === "Reset") {
      resetGame();
    }
  }

  function startGame() {
    if (img === "") {
      alert("Please select an image before you start the game");
    } else {
      setGameParams((prevState) => ({ ...prevState, gameOn: true, startTime: Date.now(), gameFinished: false }));
      checkerFunction({ "thing": things[0], "x": -1, "y": -1, "img": selectedImage }).then(result => console.log("initialized"));
      const intervalRef = setInterval(() => {
        setGameParams((prevState) => ({ ...prevState, time: Date.now() - prevState.startTime }));
      }, 750);
      setIntervalRef(intervalRef);
      setFoundThingsPointList([]);
      setFoundThings([]);
    }
  }

  function endGame() {
    setGameParams((prevState) => ({ startTime: 0, gameOn: false, time: Date.now() - prevState.startTime, gameFinished: true }));
    clearInterval(intervalRef);
  }

  function resetGame() {
    setGameParams({ startTime: 0, gameOn: false, time: 0, gameFinished: false });
    clearInterval(intervalRef);
    setFoundThingsPointList([]);
    setFoundThings([]);
  }

  function preloadImage(url) {
    const img = new Image();
    img.src = url;
  }

  function toggleImages() {
    setImagesOpen((prevState => !prevState));
  }

  function toggleThings() {
    setThingsOpen((prevState => !prevState));
  }

  function updateName(event) {
    const name = event.target.value;
    setName(name);
  }

  async function saveTime(event) {
    if (gameParams.time > 0) {
      if (selectedImageWinners.every(winner => winner.name !== name)) {
        const docRef = doc(db, "Imgs", selectedImage);
        await updateDoc(docRef, { "winners": arrayUnion({ "name": name, "time": gameParams.time }) });
        setSelectedImageWinners(prevState => [...prevState, { "name": name, "time": gameParams.time }]);
        alert(`Time saved, ${name}`);
      } else {
        alert("You need to pick a different name");
      }
    } else {
      alert("nice try trying to save your time with zero time");
    }
  }

  return (
    <div className="App">
      <Header imagesOpen={imagesOpen} thingsOpen={thingsOpen} toggleImages={toggleImages} toggleThings={toggleThings} />
      <div id="imgContainer">
        {
        img === ""
          ? <p>Welcome to search game! The goal of the game is to find all the things in the image the fastest. Select an image on the left sidebar to get started. </p>
          : <img src={img} alt="game" onClick={openMenu} onMouseMove={mouseMove} className={gameParams.gameOn || gameParams.gameFinished ? "App-header" : "App-header blur"} />
        }
      </div>
      {thingsOpen && <ThingsSidebar things={things} foundThings={foundThings} startGame={startGame} gameParams={gameParams} className={gameParams.gameOn || gameParams.gameFinished ? "" : "blurText"} winners={selectedImageWinners} />}
      {imagesOpen && <ImagesSidebar images={images} loadImage={loadImage} selectedImage={selectedImage} />}
      <div id="foundThingsMarkerContainer">
        {foundThingsPointList.map((point, index) => <p key={index} style={{ top: point.y - 24, left: point.x - 12 }} data-text={foundThings[index]}>✔</p>)}
      </div>
      {boxOpen && <SelectionBox loc={boxLoc} things={things} foundThings={foundThings} checkGuess={checkGuess} />}
      <GameStatusBar handleMainButtonClick={handleMainButtonClick} gameParams={gameParams} name={name} updateName={updateName} saveTime={saveTime} />
    </div>
  );
}


export default App;


