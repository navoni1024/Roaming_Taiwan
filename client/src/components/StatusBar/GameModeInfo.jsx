    const GameModeInfo = ({gameMode, timer, correctAnswerCount, questionsRemain}) => {
        if(gameMode === 'timeLimit'){
            return(
                <>
                    <div>剩餘時間: <b>{timer}</b> 秒</div>
                    <div className='score'>答題情況: <b>{correctAnswerCount}</b></div>
                </>
            )
        }else if(gameMode === 'questionsComplete'){
            return(
                <>
                    <div>剩餘題目: <b>{questionsRemain}</b> 題</div>
                    <div>花費時間: <b>{timer}</b> 秒</div>
                </>
            )
        }else{
            return(
                <>
                    <div>{gameMode}</div>
                </>
            )
        }
    }

    export default GameModeInfo;