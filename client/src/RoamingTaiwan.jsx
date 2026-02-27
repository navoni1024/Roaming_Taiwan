import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef} from 'react';
import { MapContainer } from 'react-leaflet/MapContainer'
import { GeoJSON } from 'react-leaflet/GeoJSON'
import mapdata from "./geojson/TW_town_WGS84_precision_6.json"
import countryGeoJson from "./geojson/TW_country_WGS84_precision_6.json"

import StatusBar from './components/StatusBar'
import SettingsBar from './components/SettingsBar';
import UserInfo from './components/UserInfo';
import GameControls from './components/GameControls';

/* 
    Timer( seconds , countDown=false , pause=false){

    }

    gameMode = {"timeLimit", "questionsComplete"}
    
    gameActive = true/false 遊戲進行的鎖 

    handleReset 重新開始

    生成的題目陣列
    猜的題目
    正確數量/錯誤數量
    顯示猜題狀況的圖層

    -> 這些重新時要復舊



*/

const RoamingTaiwan = () => {

    //const DEBUG = true;

    const mapStyle={
        weight: 1,
        fillOpacity: 1,
        fillColor: "rgb(128, 206, 197)",
        color: "rgb(230,230,230)",
    };

    const defaultCountryBoundaryStyle = {
        weight: 1,
        opacity: 1,
        fillOpacity: 0,
        color: "rgb(1,1,1)",
        interactive: false
    }

    const mapBound =[
        [26.504979796639104, 116.100698791452],
        [20.67667721806277, 125.49054604625438],
    ]

    const [isBingoWaiting, setIsBingoWaiting] = useState(0);
    const [selectedTownName, setSelectedTownName] = useState();
    const [randomQuetion, setRandomQuetion] = useState();
    const [score, setScore] = useState(0);
    const questionRef = useRef(randomQuetion);

    const [timeLeft, setTimeLeft] = useState(0);

    const [gameActive, setGameActive] = useState(false);
    const [gamePause, setGamePause] = useState(false);
    const [isResult, setIsResult] = useState(false);

    const [gameMode, setGameMode] = useState('');                   // timeLimit questionComplete
    const [gameTime, setGameTime] = useState(100);                  // for questionComplete
    const [questionCount, setQuestionCount] = useState(10);         //這timeLimit的題數
    const [acceptDuplicateQuestion, setAcceptDuplicateQuestion] = useState(false);
    const [showAnsweredArea, setShowAnsweredArea] = useState(true);
    const [showFullQuestion, setShowFullQuestion] = useState(true); //題目顯示縣市名 
    const [showCountryBoundary, setShowCountryBoundary] = useState(true);
    const [countryBoundaryStyle, setCountryBoundaryStyle] = useState(defaultCountryBoundaryStyle);

    //這裡好像是初始化
    useEffect(()=>{
        const keys = Object.keys(mapdata.features);
        const randIndex = Math.floor(Math.random() * keys.length);
        setRandomQuetion(mapdata.features[randIndex].properties.TOWNNAME);
    },[]);

    useEffect(()=>{
        questionRef.current = randomQuetion;
    },[randomQuetion]);

    useEffect(() => {
        let timer; //this is seconds

        if(gameActive && !gamePause){
            if(gameMode === 'timeLimit'){
                if(timeLeft > 0){    
                    timer = setInterval(() => {
                        setTimeLeft(prev => prev - 1)
                    },1000);

                }else if(timeLeft === 0){
                    setgameActive(false);
                    setTimeLeft(gameTime);
                }
            }

            if(gameMode === "questionsComplete"){
                timer = setInterval(() => {
                    setTimeLeft(prev => prev + 1)
                },1000);
            }
        }

        return () => clearInterval(timer);
    },[gameActive, timeLeft, gamePause])


    useEffect( () => {
        if(showCountryBoundary){
            setCountryBoundaryStyle({
                weight: 0,
                opacity: 0,
                fillOpacity: 0,
                color: "rgb(1,1,1)",
                interactive: false
            })
        }else{
            setCountryBoundaryStyle({
                weight: 1,
                opacity: 1,
                fillOpacity: 0,
                color: "rgb(1,1,1)",
                interactive: false
            })
        }
    }, [showCountryBoundary])


    const bingoAction = () => {
        const keys = Object.keys(mapdata.features);
        const randIndex = Math.floor(Math.random() * keys.length);
        setRandomQuetion(mapdata.features[randIndex].properties.TOWNNAME);
        setScore(prev => prev + 1);
        setSelectedTownName("");
        setIsBingoWaiting(0);
    }

    const handleReset = () => {
        
    }

    const mapFeature=(country, layer)=>{
        layer.on({
            
            mouseover: (e) => {
                e.target.setStyle({
                    fillOpacity: 0.5,
                });
            },

            mouseout: (e) => {
                e.target.setStyle({
                    fillOpacity: 1,
                });
            },

            click: (e) => {
                if((questionRef.current===e.sourceTarget.feature.properties.TOWNNAME)&&(isBingoWaiting===0)){
                    setSelectedTownName(e.sourceTarget.feature.properties.TOWNNAME);
                    setIsBingoWaiting(1);
                    setTimeout(bingoAction,1000); //this is microseconds
                }
                else if(isBingoWaiting===0){
                    setSelectedTownName(e.sourceTarget.feature.properties.TOWNNAME);
                }
            }
        });
    }

    return (
        <div className='container' style={{ fontFamily: '"PMingLiU", "新細明體", serif' }}>
            <MapContainer center={[23.6, 120.9738819]} zoom={7} minZoom={7} maxBounds={mapBound}>
                <GeoJSON style={mapStyle} data={mapdata} onEachFeature={mapFeature}></GeoJSON>
                <GeoJSON style={countryBoundaryStyle} data={countryGeoJson} />
            </MapContainer>
            <div className='sidebar'>
                <UserInfo />
                <StatusBar 
                    gameMode={gameMode}
                    questionTown={randomQuetion} 
                    selectedTownName={selectedTownName}
                    timer={timeLeft}
                    questionRemain={10}
                    corretAnswerCount={score}
                    isBingoWaiting={isBingoWaiting}
                />
                <SettingsBar 
                    gameMode={gameMode}
                    setGameMode={setGameMode}
                    gameTime={gameTime}
                    setGameTime={setGameTime}
                    acceptDuplicateQuestion={acceptDuplicateQuestion}
                    setAcceptDuplicateQuestion={setAcceptDuplicateQuestion}
                    showAnsweredArea={showAnsweredArea}
                    setShowAnsweredArea={setShowAnsweredArea}
                    showFullQuestion={showFullQuestion}
                    setShowFullQuestion={setShowFullQuestion}
                    showCountryBoundary={showCountryBoundary}
                    setShowCountryBoundary={setShowCountryBoundary}
                />
                <GameControls
                    gameActive={gameActive}
                    isResult={isResult}
                    startOnClick={() => {setGameActive((prev) => !prev)}}
                    pauseOnClick={() => {setGamePause((prev) => !prev)}}
                    exitOnclick={handleReset}
                />

            </div>
        </div>
    );
}

export default RoamingTaiwan;
