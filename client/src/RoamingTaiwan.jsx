import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef, useMemo} from 'react';

import StatusBar from './components/StatusBar'
import SettingsBar from './components/SettingsBar';
import UserInfo from './components/UserInfo';
import GameControls from './components/GameControls';
import RoamingTaiwanMap from './components/RoamingTaiwanMap';

const DEBUG = true;

const RoamingTaiwan = () => {

    const QUESTION_COMPLETE_COUNT_MAX = 368;
    const QUESTION_COMPLETE_COUNT_MIN = 3;
    const TIMELIMIT_TIME_MAX = 210;
    const TIMELIMIT_TIME_MIN = 5;

    const TIMER_DEFAULT = Number(65);
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

    const [questionsBank, setQuestionsBank] = useState();
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
    
    const [currentClickProperties, setCurrentClickProperties] = useState();
    const answerRef = useRef({});

    useEffect( () => {
        answerRef.current = questionsList[0];
    }, [questionsList]);

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
        const keys = Object.keys(questionsBank);

        do{
            const randIndex = Math.floor(Math.random() * keys.length);
            const randKey = keys[randIndex];
            const randomResult = questionsBank[randKey].properties;
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
        
        setQuestionsList([{
            'TOWNID': '',
            'COUNTYNAME': '',
            'TOWNNAME': ''
        },
        ]);
        
        setSelectedTownName('');
        setIsBingoWaiting(false);
        setGamePause(false);
        setGameTime(TIMER_DEFAULT);
        setTimeLeft(gameTime);
        setCorrectHistory([]);
        setWrongHistory([]);
    }

    const timeLimitModeInit = () => {
        const newQuestion = getRandomQuestion();

        setQuestionsList([newQuestion]);
        setGameTime(0);
        setCorrectHistory([]);
        setWrongHistory([]);

        setTimeLeft(gameTime);
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

        if(gameMode==='timeLimit'){
            const newQuestion = getRandomQuestion();
            setQuestionsList([newQuestion]);
        }

        if(gameMode==='questionsComplete'){
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

    //原本的judgeClick和useEffect都合在這了

    useEffect(() => {
        if(currentClickProperties === undefined) return;
        const clickProperties = currentClickProperties.sourceTarget.feature.properties; 

        if(gamePause|| (gameActive && isResult)) return;
        if(gameActive && !isBingoWaiting){
            if(useTownId){
                if(clickProperties.TOWNID === answerRef.current.TOWNID){
                    setIsBingoWaiting(true);
                    setCorrectHistory( prev => [...prev,  answerRef.current]);
                    bingoAction();
                }else{
                    setWrongHistory( prev => [...prev,  {'TOWNID': clickProperties.TOWNID, 'COUNTYNAME': clickProperties.COUNTYNAME, 'TOWNNAME': clickProperties.TOWNNAME}]);
                }
            }else{
                if(clickProperties.TOWNNAME === answerRef.current.TOWNNAME){
                    setIsBingoWaiting(true);
                    setCorrectHistory( prev => [...prev,  answerRef.current]);
                    bingoAction();
                }else{
                    if(answerRef.current.TOWNID in wrongTownIdArray) return; 
                    setWrongHistory( prev => [...prev,  {'TOWNID': clickProperties.TOWNID, 'COUNTYNAME': clickProperties.COUNTYNAME, 'TOWNNAME': clickProperties.TOWNNAME}]);
                }
            }
        }
        if(showFullQuestion){
            setSelectedTownName(clickProperties.COUNTYNAME+' '+clickProperties.TOWNNAME);
        }else{
            setSelectedTownName(clickProperties.TOWNNAME);
        }
        
    }, [currentClickProperties])

    //地圖相關---------------------------------------------------------------

    
    

    //網頁結構---------------------------------------------------------------

    return (
        <div className='container' style={{ fontFamily: '"PMingLiU", "新細明體", serif' }}>
            <div className='game-area' style={overlayStyle}>
                <RoamingTaiwanMap
                    gameActive={gameActive}
                    gamePause={gamePause}
                    isResult={isResult}
                    gameMode={gameMode}
                    isBingoWaiting={isBingoWaiting}

                    showFullQuestion={showFullQuestion}
                    showCountryBoundary={showCountryBoundary}
                    showAnsweredArea={showAnsweredArea}

                    questionsList={questionsList}
                    correctHistory={correctHistory}
                    wrongHistory={wrongHistory}

                    setCurrentClickProperties={setCurrentClickProperties}
                    setQuestionsBank={setQuestionsBank}
                />
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
