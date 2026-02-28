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

const DEBUG = true;

const RoamingTaiwan = () => {

    const QUESTION_COMPLETE_COUNT_MAX = 368;
    const QUESTION_COMPLETE_COUNT_MIN = 3;
    const TIMELIMIT_TIME_MAX = 210;
    const TIMELIMIT_TIME_MIN = 5;

    const TIMER_DEFAULT = Number(120);
    const QUESTIONS_COUNT_DEFAULT = 3;

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
    
    /*
    //原本的邏輯
    const [isBingoWaiting, setIsBingoWaiting] = useState(0);
    const [selectedTownName, setSelectedTownName] = useState();
    const [randomQuetion, setRandomQuetion] = useState();
    const [score, setScore] = useState(0);
    const questionRef = useRef(randomQuetion);
    */
   
    //遊戲狀態
    const [gameActive, setGameActive] = useState(false);
    const [gamePause, setGamePause] = useState(false);
    const [isResult, setIsResult] = useState(false);

    //設定
    const [gameMode, setGameMode] = useState('');                   // timeLimit questionsComplete
    const [gameTime, setGameTime] = useState(100);                  // for timeLimit
    const [questionsCount, setQuestionsCount] = useState(QUESTIONS_COUNT_DEFAULT);     //questionsComplete題數(已棄用)
    const [acceptDuplicateQuestion, setAcceptDuplicateQuestion] = useState(false);
    const [showAnsweredArea, setShowAnsweredArea] = useState(true);
    const [showFullQuestion, setShowFullQuestion] = useState(true); //題目顯示縣市名 
    const [showCountryBoundary, setShowCountryBoundary] = useState(true); //總有一天會回來把他改成county的 吃了文化不足的虧:hakase:
    const [countryBoundaryStyle, setCountryBoundaryStyle] = useState(defaultCountryBoundaryStyle);
    const [useTownId, setUseTownId] = useState(false); //如果false會使用TOWNNAME比對

    //遊戲進行時的參數
    const [timeLeft, setTimeLeft] = useState(TIMER_DEFAULT);   //計時都用這個 所以要記得清空 對
    const [questionsList, setQuestionsList] = useState([{
        'TOWNID': '',
        'COUNTYNAME': '',
        'TOWNNAME': ''
    },
    ]);
    const [correctHistory, setCorrectHistory] = useState([{
        'TOWNID': '',
        'COUNTYNAME': '',
        'TOWNNAME': ''
    },
    ]);
    const [wrongHistory, setWrongHistory] = useState([{
        'TOWNID': '',
        'COUNTYNAME': '',
        'TOWNNAME': ''
    },
    ]);
    const [isBingoWaiting, setIsBingoWaiting] = useState(false);
    const [selectedTownName, setSelectedTownName] = useState();

//old version---------------------
/*    
    useEffect(()=>{
        const keys = Object.keys(mapdata.features);
        const randIndex = Math.floor(Math.random() * keys.length);
        setRandomQuetion(mapdata.features[randIndex].properties.TOWNNAME);
    },[]);

    useEffect(()=>{
        questionRef.current = randomQuetion;
    },[randomQuetion]);

    
    const bingoAction = () => {
        const keys = Object.keys(mapdata.features);
        const randIndex = Math.floor(Math.random() * keys.length);
        setRandomQuetion(mapdata.features[randIndex].properties.TOWNNAME);
        setScore(prev => prev + 1);
        //for test
        setCorrectAnswerCount(score);
        //----
        setSelectedTownName("");
        setIsBingoWaiting(0);
    }
*/
//----------------------------------

    /* 
    //New geojson
    {
        "type": "FeatureCollection",
        "name": "TW_town_WGS84_precision_6",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        "features": [
        { "type": "Feature", "properties": { "TOWNID": "V02", "TOWNCODE": "10014020", "COUNTYNAME": "臺東縣", "TOWNNAME": "成功鎮", 
    */


    const getRandomQuestion = (prevQuestion={'TOWNID': '', 'COUNTYNAME': '', 'TOWNNAME':''}) =>{
        
        let ERROR_BOUNDS = 10;
        const keys = Object.keys(mapdata.features);

        do{
            const randIndex = Math.floor(Math.random() * keys.length);
            const randKey = keys[randIndex];
            const randomResult = mapdata.features[randKey].properties;
            ERROR_BOUNDS--;

            if( randomResult.TOWNNAME !== prevQuestion.TOWNNAME ){

                let result = {
                    'TOWNID': randomResult.TOWNID,
                    'COUNTYNAME': randomResult.COUNTYNAME,
                    'TOWNNAME': randomResult.TOWNNAME
                };

                if(DEBUG){ console.log(result); }
                
                return result;
            }else{
                continue;
            }
            
        }while(ERROR_BOUNDS > 0)

        return {'TOWNID': 'ERROR', 'COUNTYNAME': 'ERROR', 'TOWNNAME':'ERROR'}; //有空再回來改 先這樣 
    }


    //計時器
    useEffect(() => {
        let timer; //this is seconds

        if(gameActive && !gamePause){
            if(gameMode === 'timeLimit'){
                if(timeLeft > 0){    
                    timer = setInterval(() => {
                        setTimeLeft(prev => prev - 1)
                    },1000);

                }else if(timeLeft === 0){
                    setGameActive(false);
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

    /*
                gameActive  isResult
        開始頁面    F           F           
        遊戲中      T           F           
        結束        T           T           
    */

    useEffect( () => {
        if(gameActive){
            if(isResult){
                //到結束畫面                

            }else{
                //遊戲初始化
                //TODO: 鎖上settingBar
                if(gameMode==='timeLimit'){
                    timeLimitModeInit();

                }
                if(gameMode==='questionsComplete'){
                    questionsCompleteModeInit();
                }
            }

        }else{
            //到開始畫面
            handleReset();
        }
    }, [gameActive, isResult])

    const handleReset = () => {
        setGameTime(0);
        setTimeLeft(TIMER_DEFAULT);
        setQuestionsCount(QUESTIONS_COUNT_DEFAULT);
        setQuestionsList([{
            'TOWNID': '',
            'COUNTYNAME': '',
            'TOWNNAME': ''
        },
        ])
        setCorrectHistory([]);
        setWrongHistory([]);
        setIsBingoWaiting(false);
    }

    const timeLimitModeInit = () => {
        const newQuestion = getRandomQuestion();

        setQuestionsList([newQuestion]);
        setGameTime(0);
        setCorrectHistory([]);
        setWrongHistory([]);
    }

    const questionsCompleteModeInit = () => {
        let newQuestionList = []

        for( let i = 0;i < questionsCount; i++ ){
            const newQuestion = getRandomQuestion();
            newQuestionList.push(newQuestion);
        }

        setQuestionsList([...newQuestionList])
        //setQuestionsRemain(newQuestionList.length);
        setTimeLeft(0);
        setCorrectHistory([]);
        setWrongHistory([]);
    }

    const bingoAction = () => {

        if(modeRef.current==='timeLimit'){
            console.log("in timeLimit process");
            const newQuestion = getRandomQuestion();
            setQuestionsList([newQuestion]);
        }

        if(modeRef.current==='questionsComplete'){
            setQuestionsList( (prev) => {
                if( prev.length <= 1){
                    setIsResult(true);
                    return prev;
                }else{
                    return prev.slice(1);
                }
            })
        }
    };

    useEffect(() => {
        if(isBingoWaiting === true && gameActive === true){
            setIsBingoWaiting(false);
        }
    }, [questionsList])

    const judgeClick = (clickProperties) => {
        if(useTownId){
            if(clickProperties.TOWNID === answerRef.current.TOWNID){
                setIsBingoWaiting(true);
                setCorrectHistory( prev => [...prev,  answerRef.current]);
                bingoAction();
            }else{
                setWrongHistory( prev => [...prev,  answerRef.current]);
            }
        }else{
            if(clickProperties.TOWNNAME === answerRef.current.TOWNNAME){
                setIsBingoWaiting(true);
                setCorrectHistory( prev => [...prev,  answerRef.current]);
                bingoAction();
            }else{
                setWrongHistory( prev => [...prev,  answerRef.current]);
            }
        }
    }

    //地圖相關

    //ref for leaflet
    const answerRef = useRef({});
    const modeRef = useRef('');
    const useTownIdRef = useRef(useTownId);
    const gameActiveRef = useRef(gameActive);
    const gamePauseRef = useRef(gamePause);
    const isResultRef = useRef(isResult);
    const isBingoWaitingRef = useRef(isBingoWaiting);

    useEffect(() => {
        answerRef.current = questionsList[0];
        modeRef.current = gameMode;
        useTownIdRef.current = useTownId;
        gameActiveRef.current = gameActive;
        gamePauseRef.current = gamePause;
        isResultRef.current = isResult;
        isBingoWaitingRef.current = isBingoWaiting;
    },[questionsList, gameMode, useTownId, gamePause, isResult, isBingoWaiting]);

    useEffect( () => {
        if(showCountryBoundary){
            setCountryBoundaryStyle({
                weight: 1,
                opacity: 1,
                fillOpacity: 0,
                color: "rgb(1,1,1)",
                interactive: false
            })
        }else{
            setCountryBoundaryStyle({
                weight: 0,
                opacity: 0,
                fillOpacity: 0,
                color: "rgb(1,1,1)",
                interactive: false
            })
        }
    }, [showCountryBoundary])

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
                if(gameActiveRef.current && !isBingoWaitingRef.current){
                    //console.log('judging'+e.sourceTarget.feature.properties.TOWNNAME);
                    judgeClick(e.sourceTarget.feature.properties);
                }
                setSelectedTownName(e.sourceTarget.feature.properties.TOWNNAME);
            }
        });
    }



    //for test
    //const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
    //----

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
                    questionTown={questionsList[0].TOWNNAME} 
                    selectedTownName={selectedTownName}
                    timer={timeLeft}
                    questionsRemain={questionsList.length}
                    correctAnswerCount={correctHistory.length}
                    isBingoWaiting={isBingoWaiting}
                />
                <SettingsBar 
                    gameMode={gameMode}
                    setGameMode={setGameMode}
                    gameTime={timeLeft}
                    setGameTime={setTimeLeft}
                    questionsCount={questionsCount}
                    setQuestionsCount={setQuestionsCount}
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
                    exitOnclick={() => {
                        setGameActive(false);
                        setIsResult(false);
                    }}
                />

            </div>
        </div>
    );
}

export default RoamingTaiwan;
