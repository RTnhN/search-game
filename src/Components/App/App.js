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
const checkerFunction = httpsCallable(functions, 'checkerFunction');

function App() {
  const [img, setImg] = useState("");
  const [xy, setxy] = useState({ x: 0, y: 0 });
  const [gameParams, setGameParams] = useState({ gameOn: false, startTime: 0, time: 0, gameFinished: false });
  const [things, setThings] = useState([]);
  const [foundThings, setFoundThings] = useState([]);
  const [foundThingsPointList, setFoundThingsPointList] = useState([]);
  const [remainingThings, setRemainingThings] = useState([]);
  const [boxParams, setBoxParams] = useState({open:false, maxAngle:360, minAngle:0, loc: { top: 0, left: 0 }});
  const [imagesOpen, setImagesOpen] = useState(false);
  const [thingsOpen, setThingsOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [name, setName] = useState("Name");
  const [intervalRef, setIntervalRef] = useState(null);
  const [docsSnapshot, setDocsSnapshot] = useState(null);
  const [selectedImageWinners, setSelectedImageWinners] = useState([]);
  const [timeLastItem, setTimeLastItem] = useState(0);

  function openMenu(event) {
    if (gameParams.gameOn) {
      const target = event.target;
      const boundingRect = target.getBoundingClientRect();
      const x = (event.pageX - boundingRect.left - window.scrollX) / (boundingRect.width);
      const y = (event.pageY - boundingRect.top - window.scrollY) / (boundingRect.height);
      setxy({ x: x, y: y });
      const MAX_FACTOR = .85;
      const MIN_FACTOR = .15;
      const xTooBig = Math.floor(x/MAX_FACTOR);
      const yTooBig = Math.floor(y/MAX_FACTOR);
      const xTooSmall = Math.floor((1-x)/(1-MIN_FACTOR))
      const yTooSmall = Math.floor((1-y)/(1-MIN_FACTOR))
      const minMaxAngles = truthTable[`${xTooBig}_${yTooBig}_${xTooSmall}_${yTooSmall}`];
      setBoxParams(prevState => ({...prevState, open:true, ...minMaxAngles, loc: { left: event.pageX, top: event.pageY } }))
    }
  }

  function mouseMove(event) {
    const FENCE_RADIUS = .3;
    const target = event.target;
    const boundingRect = target.getBoundingClientRect();
    const x = (event.pageX - boundingRect.left - window.scrollX) / (boundingRect.width);
    const y = (event.pageY - boundingRect.top - window.scrollY) / (boundingRect.height);
    if (Math.sqrt((x - xy.x) ** 2 + (y - xy.y) ** 2) > FENCE_RADIUS && target.parentElement !== document.getElementById("selectionBox")) {
      setBoxParams(prevState => ({...prevState, open:false}))
    }
  }

  async function checkGuess(event) {
    const name = event.target.dataset.name;
    if (!foundThings.includes(name)) {
      const result = await checkerFunction({ "thing": name, "x": xy.x, "y": xy.y, "img": selectedImage });
      setBoxParams(prevState => ({...prevState, open:false}))
      if (result.data.found) {
        const percentxy = {x:Math.floor(xy.x*100), y:Math.floor(xy.y*100)}
        setFoundThings(prevState => [...prevState, name]);
        setRemainingThings(prevState => prevState.filter(thing => thing !== name));
        setFoundThingsPointList(prevState => [...prevState, percentxy]);
        setTimeLastItem(Date.now());
      }
      setBoxParams(prevState => ({...prevState, open:false}))
    }
  }

  // eslint-disable-next-line
  useEffect(() => { fetchData(); }, []);

  async function loadImage(event) {
    const imgName = event.target.dataset.name;
    setSelectedImage(imgName);
    const docSnap = docsSnapshot.docs.find(doc => doc.id === imgName);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const url = await getDownloadURL(ref(storage, data.URLPath));
      setImg(url);
      checkerFunction({ "thing": data.things[0].name, "x": -1, "y": -1, "img": docSnap.id }).then(result => console.log("initialized"));
      setThings(data.things.map(thing => thing.name));
      setRemainingThings(data.things.map(thing => thing.name));
      setSelectedImageWinners(data.winners === undefined ? [] : data.winners);
    }
    setFoundThingsPointList([]);
    setFoundThings([]);
    setGameParams({ startTime: 0, gameOn: false, time: 0, gameFinished: false });
    clearInterval(intervalRef);
  }

  async function fetchData() {
    const collectionRef = collection(db, "Imgs");
    const docsSnap = await getDocs(collectionRef);
    setDocsSnapshot(docsSnap);
    const images = docsSnap.docs.map(img => ({name:img.id, thingsNum: img.data().things.length}));
    setImages(images);
    docsSnap.docs.forEach(async (img) => {
      const url = await getDownloadURL(ref(storage, img.data().URLPath));
      preloadImage(url);
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
      checkerFunction({ "thing": things[0], "x": -1, "y": -1, "img": selectedImage }).then(result => console.log("initialized"));
      setGameParams((prevState) => ({ ...prevState, gameOn: true, startTime: Date.now(), gameFinished: false }));
      setIntervalRef(setInterval(() => {
        setGameParams((prevState) => ({ ...prevState, time: Date.now() - prevState.startTime }));
      }, 1000));
      setFoundThingsPointList([]);
      setFoundThings([]);
    }
  }
  
  useEffect(()=>{
    if (things.length > 0) {
    if (things.every(thing => foundThings.includes(thing)) && foundThings.length >= things.length) {
      endGame();
    }
    // eslint-disable-next-line
  }}, [foundThings]);
  

  function endGame() {
    setGameParams((prevState) => ({ startTime: 0, gameOn: false, time: timeLastItem - prevState.startTime, gameFinished: true }));
    clearInterval(intervalRef);
  }

  function resetGame() {
    setGameParams({ startTime: 0, gameOn: false, time: 0, gameFinished: false });
    clearInterval(intervalRef);
    setFoundThingsPointList([]);
    setFoundThings([]);
    setRemainingThings(things);
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

  async function saveTime() {
    if (gameParams.time > 0 && gameParams.gameFinished) {
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
    fetchData();
  }

  return (
    <div className="App">
      <Header imagesOpen={imagesOpen} thingsOpen={thingsOpen} toggleImages={toggleImages} toggleThings={toggleThings} />
      <div id="imgContainer">
        {
        img === ""
          ? <p id="placeholderText">Welcome to search game! The goal of the game is to find all the things in the image the fastest. Select an image on the left sidebar to get started. </p>
          : <img src={img} alt="game" onClick={openMenu} onMouseMove={mouseMove} className={gameParams.gameOn || gameParams.gameFinished ? "App-header" : "App-header blur"} />
        }
        {foundThingsPointList.map((point, index) => <p className="guessPoint" key={index} style={{ top: `${point.y}%`, left: `${point.x}%` }} data-text={foundThings[index]}>✔</p>)}
      </div>
      {thingsOpen && <ThingsSidebar things={things} foundThings={foundThings} startGame={startGame} gameParams={gameParams} className={gameParams.gameOn || gameParams.gameFinished ? "" : "blurText"} winners={selectedImageWinners} />}
      {imagesOpen && <ImagesSidebar images={images} loadImage={loadImage} selectedImage={selectedImage} />}
      {boxParams.open && <SelectionBox boxParams={boxParams} remainingThings={remainingThings} checkGuess={checkGuess} />}
      <GameStatusBar handleMainButtonClick={handleMainButtonClick} gameParams={gameParams} name={name} updateName={updateName} saveTime={saveTime} />
    </div>
  );
}

function preloadImage(url) {
  const img = new Image();
  img.src = url;
}

export default App;

const truthTable = {
//Right_Bottom_Left_Top
"0_0_0_0":{maxAngle:360, minAngle:0},
"0_0_0_1":{maxAngle:360, minAngle:180},
"0_0_1_0":{maxAngle:90, minAngle:-90},
"0_0_1_1":{maxAngle:270, minAngle:360},
"0_1_0_0":{maxAngle:0, minAngle:180},
"0_1_1_0":{maxAngle:0, minAngle:90},
"1_0_0_0":{maxAngle:270, minAngle:90},
"1_0_0_1":{maxAngle:270, minAngle:180},
"1_1_0_0":{maxAngle:180, minAngle:90}
}

