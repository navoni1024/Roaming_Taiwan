const SettingsBar = ({

    gameMode, setGameMode,
    gameTime, setGameTime,
    questionsCount, setQuestionsCount,
    acceptDuplicateQuestion, setAcceptDuplicateQuestion,
    showAnsweredArea, setShowAnsweredArea,
    showFullQuestion, setShowFullQuestion,
    showCountryBoundary, setShowCountryBoundary,
    
    }) => {

    const handleGameModeChange = (e) => {
        setGameMode(e.target.value); //e代表觸發事件標籤好像
    }

    const GameModeParameters = () => {
        if(gameMode === ''){
            return(
            <>
            </>
            );
        }

        if(gameMode === 'timeLimit'){
            return(
                <li >
                    <span id="game-time">遊戲時間:</span>
                    <span id="game-time-field">
                        <input type="number" value={gameTime} onChange={(e) => {setGameTime(Number(e.target.value))}}></input>
                        <span id="seconds"> 秒</span>
                    </span>
                </li>
            )
        }

        if(gameMode === 'questionsComplete'){ //懶的改ID 可能有一天會改
            return(
                <li >
                    <span id="game-time">題目數量:</span>   
                    <span id="game-time-field">
                        <input type="number" value={questionsCount} onChange={(e) => {setQuestionsCount(Number(e.target.value))}}></input>
                        <span id="seconds"> 題</span>
                    </span>
                </li>
            )
        }


    }

    return(
        <div className="section settings-bar">
            <ul>
                <li>
                    <span>遊戲模式:</span>
                    <select id="gamemode-select" value={gameMode} onChange={handleGameModeChange}>
                        <option value="">請選擇模式^^</option>
                        <option value="timeLimit">限時答題</option>
                        <option value="questionsComplete">指定題數</option>
                    </select>
                </li>  
                <GameModeParameters/>
                <li>
                    <span>允許重複題目:</span>
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