import { useState, useEffect, useRef } from "react";

const SettingsBar = ({
    gamePause, gameActive,
    gameMode, setGameMode,
    gameTime, setGameTime,
    questionsCount, setQuestionsCount,
    acceptDuplicateQuestion, setAcceptDuplicateQuestion,
    showAnsweredArea, setShowAnsweredArea,
    showFullQuestion, setShowFullQuestion,
    showCountryBoundary, setShowCountryBoundary,
    
    }) => {


    const QUESTIONS_COMPLETE_MAX = 9999;
    const QUESTIONS_COMPLETE_MIN = 1;
    const TIME_LIMIT_MAX = 9999;
    const TIME_LIMIT_MIN = 3;
    const ACCEPT_DUPLICATE_QUESTION_UPPER_BOUND =  367; //這是0-367的意思 共368題 

    const handleGameModeChange = (e) => {
        setGameMode(e.target.value); //e代表觸發事件標籤好像
    }

    const [localGameTime, setLocalGameTime] = useState(gameTime);
    const inputGameTimeRef = useRef(null);

    useEffect(() => {
        setLocalGameTime(gameTime);
    }, [gameTime]);


    const [localQuestionsCount, setLocalQuestionsCount] = useState(questionsCount);
    const [outOfBoundaryWarning, setOutOfBoundaryWarning] = useState('');
    const inputQuestionsRef = useRef(null);
    
    useEffect( () => {
        setOutOfBoundaryWarning('');
    }, [gameMode, gameActive])

    const handleQuestionsCountSubmit = () => {
        if (inputQuestionsRef.current) {
            const inputValue = Number(inputQuestionsRef.current.value);

            if(inputValue > QUESTIONS_COMPLETE_MAX || inputValue < QUESTIONS_COMPLETE_MIN){
                setOutOfBoundaryWarning(`(${QUESTIONS_COMPLETE_MIN} ~ ${QUESTIONS_COMPLETE_MAX})`);
                return;
            }
            
            setQuestionsCount(inputValue);
            setOutOfBoundaryWarning('');
        }
    }

    const handleGameTimeSubmit = () => {
        if (inputGameTimeRef.current) {
            const inputValue = Number(inputGameTimeRef.current.value);

            if((inputValue > TIME_LIMIT_MAX) || (inputValue < TIME_LIMIT_MIN)){
                setOutOfBoundaryWarning(`(${TIME_LIMIT_MIN} ~ ${TIME_LIMIT_MAX})`);
                return;
            }
            
            setQuestionsCount(inputValue);
            setOutOfBoundaryWarning('');
        }
        setGameTime(inputValue);
    }


    useEffect(() => {
        setLocalQuestionsCount(questionsCount);
    }, [questionsCount]);

    const gameModeParameters = () => {
        if(gameMode === ''){
            return(
            <>
            </>
            );
        }

        if(gameMode === 'timeLimit'){
            return(
                <>
                <li >
                    <span id="game-time">遊戲時間:</span>
                    <span id="game-time-field">
                        <span className="oob-warning">{outOfBoundaryWarning}</span>
                        <span id="seconds"> {localGameTime} 秒</span>
                    </span>
                </li>
                <li >
                    <span id="game-time">更改時間:</span>
                    <span id="game-time-field">
                        <input type="number" ref={inputGameTimeRef}></input>
                        <button onClick={handleGameTimeSubmit}>提交</button>
                    </span>
                </li>
                </>
            )
        }

        if(gameMode === 'questionsComplete'){ //懶的改ID 可能有一天會改
            return(
                <>
                <li >
                    <span id="game-time">題目數量:</span>   
                    <span id="game-time-field">
                        <span className="oob-warning">{outOfBoundaryWarning}</span>
                        <span id="seconds"> {localQuestionsCount} 題</span>
                    </span>
                </li>
                <li >
                    <span id="game-time">更改數量:</span>   
                    <span id="game-time-field">
                        <input type="number" ref={inputQuestionsRef}></input>
                        <button onClick={handleQuestionsCountSubmit}>提交</button>
                    </span>
                </li>
                </>
            )
        }


    }

    //停止互動的效果說不定有更簡便寫法吧 但先這樣

    const [overlayStyle, setOverlayStyle] = useState({})

    useEffect (() => {
        if(gamePause || gameActive){
            setOverlayStyle({
                filter: 'grayscale(1)',
                opacity: 0.6,
                pointerEvents: 'none',
                userSelect: 'none'
            })
        }else{
            setOverlayStyle({
 
            })
        }
    }, [gamePause, gameActive])

    //原本timeLimit叫"指定題數"來著 因為那時腦子卡住不知道該叫啥

    return(
        <div className="section settings-bar" style={overlayStyle}>
            <ul>
                <li>
                    <span>遊戲模式:</span>
                    <select id="gamemode-select" value={gameMode} onChange={handleGameModeChange}>
                        <option value="">請選擇模式^^</option>
                        <option value="timeLimit">限時答題</option>
                        <option value="questionsComplete">答題計時</option> 
                    </select>
                </li>  
                {gameModeParameters()}
                <li>
                    <span><del>允許重複題目:</del></span>
                    <button
                        className={acceptDuplicateQuestion ? 'game-controls active' : 'game-controls'}
                        onClick={() => {setAcceptDuplicateQuestion(!acceptDuplicateQuestion)}}
                    >
                        {acceptDuplicateQuestion ? '開啟' : '關閉'}
                    </button>
                </li>
                <li>
                    <span>顯示已答對區域:</span>
                    <button
                        className={showAnsweredArea ? 'game-controls active' : 'game-controls'}
                        onClick={() => {setShowAnsweredArea(!showAnsweredArea)}}
                    >
                        {showAnsweredArea ? '開啟' : '關閉'}
                    </button>
                </li>  
                <li>
                    <span>顯示題目的縣市:</span>
                    <button
                        className={showFullQuestion ? 'game-controls active' : 'game-controls'}
                        onClick={() => {setShowFullQuestion(!showFullQuestion)}}
                    >
                        {showFullQuestion ? '開啟' : '關閉'}
                    </button>
                </li>
                <li>
                    <span>顯示縣界:</span>
                    <button
                        className={showCountryBoundary ? 'game-controls active' : 'game-controls'}
                        onClick={() => {setShowCountryBoundary(!showCountryBoundary)}}
                    >
                        {showCountryBoundary ? '開啟' : '關閉'}
                    </button>
                </li>  
            </ul>
        </div>
    )
}

export default SettingsBar;