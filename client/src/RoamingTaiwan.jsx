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
    const [isBingoWaiting, setIsBingoWaiting] = useState(false);

    //設定
    const [gameMode, setGameMode] = useState('');                   // timeLimit questionsComplete
    const [gameTime, setGameTime] = useState(100);                  // for timeLimit
    const [questionsCount, setQuestionsCount] = useState(QUESTIONS_COUNT_DEFAULT);     //questionsComplete題數(已棄用)
    const [acceptDuplicateQuestion, setAcceptDuplicateQuestion] = useState(false);
    const [showAnsweredArea, setShowAnsweredArea] = useState(true);
    const [showFullQuestion, setShowFullQuestion] = useState(true); //題目顯示縣市名 
    const [showCountryBoundary, setShowCountryBoundary] = useState(true); //總有一天會回來把他改成county的 吃了文化不足的虧:hakase:
    const [useTownId, setUseTownId] = useState(false); //如果false會使用TOWNNAME比對

    //遊戲進行時的參數

    const [selectedTownName, setSelectedTownName] = useState('');
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
    

    // 視窗處理

    const [overlayStyle, setOverlayStyle] = useState({})

    useEffect (() => {
        if(gamePause){
            setOverlayStyle({
                filter: 'grayscale(1)',
                opacity: 0.6,
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 9999
            })
        }else{
            setOverlayStyle({
 
            })
        }
    }, [gamePause])
    
    // 遊戲邏輯---------------------------------------------------------------

    const getRandomQuestion = (prevQuestion={'TOWNID': '', 'COUNTYNAME': '', 'TOWNNAME':''}) =>{
        
        let ERROR_BOUNDS = 10;
        const keys = Object.keys(mapdata.features);

        do{
            const randIndex = Math.floor(Math.random() * keys.length);
            const randKey = keys[randIndex];
            const randomResult = mapdata.features[randKey].properties;
            ERROR_BOUNDS--;

            if( randomResult.TOWNNAME === prevQuestion.TOWNNAME && useTownId === false){ continue; }
            if( randomResult.TOWNID === prevQuestion.TOWNID && useTownId === true){ continue; }

            let result = {
                'TOWNID': randomResult.TOWNID,
                'COUNTYNAME': randomResult.COUNTYNAME,
                'TOWNNAME': randomResult.TOWNNAME
            };

            if(DEBUG){ console.log(result); }

            return result;
            
        }while(ERROR_BOUNDS > 0)

        return {'TOWNID': 'ERROR', 'COUNTYNAME': 'ERROR', 'TOWNNAME':'ERROR'}; //有空再回來改 先這樣 
    }

    // useTownID 暫時跟 showFullQuestion 綁定 

    useEffect( () => {
        setUseTownId(showFullQuestion)
    }, [showFullQuestion]);

    useEffect(() => {
        if(!gameActive){
            setTimeLeft(gameTime);
        }
    }, [gameTime]);

    //計時器
    useEffect(() => {
        let timer; //this is seconds

        if(gameActive && !gamePause && !isResult){

            if(gameMode === 'timeLimit'){
                if(timeLeft > 0){    
                    timer = setInterval(() => {
                        setTimeLeft(prev => prev - 1)
                    },1000);

                }else if(timeLeft === 0){
                    setIsResult(true);
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
                setIsBingoWaiting(false);
                //到結束畫面                
            }else{
                //遊戲初始化
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
        //setgameTime(TIMER_DEFAULT);
        //setQuestionsCount(QUESTIONS_COUNT_DEFAULT);
        
        setTimeLeft(0);
        setQuestionsList([{
            'TOWNID': '',
            'COUNTYNAME': '',
            'TOWNNAME': ''
        },
        ]);
        setCorrectHistory([]);
        setWrongHistory([]);
        setSelectedTownName('');
        setIsBingoWaiting(false);
        setGamePause(false);
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

    //地圖相關---------------------------------------------------------------

    //ref for leaflet
    const answerRef = useRef({});
    const modeRef = useRef('');
    const showFullQuestionRef = useRef(showFullQuestion);
    const gameActiveRef = useRef(gameActive);
    const gamePauseRef = useRef(gamePause);
    const isResultRef = useRef(isResult);
    const isBingoWaitingRef = useRef(isBingoWaiting);

    useEffect(() => {
        answerRef.current = questionsList[0];
        modeRef.current = gameMode;
        showFullQuestionRef.current = showFullQuestion;
        gameActiveRef.current = gameActive;
        gamePauseRef.current = gamePause;
        isResultRef.current = isResult;
        isBingoWaitingRef.current = isBingoWaiting;
    },[questionsList, gameMode, useTownId, gamePause, isResult, isBingoWaiting]);

    const defaultMapStyle={
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

    const [mapStyle, setMapStyle] = useState(defaultMapStyle);
    const [countryBoundaryStyle, setCountryBoundaryStyle] = useState(defaultCountryBoundaryStyle);



    useEffect (() => {
        if(gamePauseRef.current){
            setMapStyle({
                weight: 1,
                fillOpacity: 1,
                fillColor: "rgb(106, 106, 106)",
                color: "rgb(230,230,230)",
                interactive: false,
                bubblingMouseEvents: false,
            });
        }else{
            setMapStyle(defaultMapStyle);
        }
    }, [gamePause])

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

    //互動的地圖
    const mapFeature=(country, layer)=>{
        layer.on({
            mouseover: (e) => {
                if(gamePauseRef.current) return;    //直接這樣硬插好像蠻暴力 但試了很多只有這樣能阻止互動
                e.target.setStyle({
                    fillOpacity: 0.5,
                });
            },

            mouseout: (e) => {
                if(gamePauseRef.current) return;
                e.target.setStyle({
                    fillOpacity: 1,
                });
            },

            click: (e) => {
                if(gamePauseRef.current || (gameActiveRef.current && isResult.current)) return;
                if(gameActiveRef.current && !isBingoWaitingRef.current){
                    judgeClick(e.sourceTarget.feature.properties);
                }
                if(showFullQuestionRef.current){
                    setSelectedTownName(e.sourceTarget.feature.properties.COUNTYNAME+' '+e.sourceTarget.feature.properties.TOWNNAME);
                }else{
                    setSelectedTownName(e.sourceTarget.feature.properties.TOWNNAME);
                }
                
            }
        });
    }

    //顯示答題相關的地圖
    const showAnsweredStyle = (feature) => {
        if(feature.TOWNNAME === "樹林區"){
            return {
                fillColor: '#000000',
                fillOpacity: 1,
                weight: 0,
                opacity: 0,
                interactive: false
            }
        }else{
            return{
                fillOpacity: 0.2,
                weight: 0,
                opacity: 0,
                interactive: false
            }
        }
    }


    //網頁結構---------------------------------------------------------------

    return (
        <div className='container' style={{ fontFamily: '"PMingLiU", "新細明體", serif' }}>
            <div className='game-area' style={overlayStyle}>
                <MapContainer center={[23.6, 120.9738819]} zoom={7} minZoom={7} maxBounds={mapBound}>
                    <GeoJSON style={mapStyle} data={mapdata} onEachFeature={mapFeature}></GeoJSON>
                    <GeoJSON style={countryBoundaryStyle} data={countryGeoJson} />
                    <GeoJSON style={showAnsweredStyle} data={mapdata} />
                </MapContainer>
            </div>
            <div className='sidebar'>
                <UserInfo />
                <StatusBar 
                    isResult={isResult}
                    gameActive={gameActive}
                    gameMode={gameMode}
                    questionTown={ showFullQuestion ? (questionsList[0].COUNTYNAME+' '+questionsList[0].TOWNNAME) : questionsList[0].TOWNNAME} 
                    selectedTownName={selectedTownName}
                    gameTime={gameTime}
                    timer={timeLeft}
                    questionsCount={questionsCount}
                    questionsRemain={questionsList.length}
                    correctAnswerCount={correctHistory.length}
                    wrongAnswerCount={wrongHistory.length}
                    isBingoWaiting={isBingoWaiting}
                />
                <SettingsBar
                    gameActive={gameActive}
                    gamePause={gamePause}
                    gameMode={gameMode}
                    setGameMode={setGameMode}
                    gameTime={gameTime}
                    setGameTime={setGameTime}
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
                    gamePause={gamePause}
                    startOnClick={() => {
                        if(gameMode!==''){setGameActive((prev) => !prev)}
                    }}
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
