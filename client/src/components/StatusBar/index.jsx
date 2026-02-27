
const StatusBar = ({ gameMode, questionTown, selectedTownName, timer, questionRemain, correctAnswerCount = 0, wrongAnswerCount = 0, isBingoWaiting}) => {

    const GameModeInfo = () => {
        if(gameMode === 'timeLimit'){
            return(
                <>
                    <div>剩餘時間: {timer}</div>
                    <div className='score'>答題情況: <b>{correctAnswerCount}</b></div>
                </>
            )
        }else if(gameMode === 'questionsComplete'){
            return(
                <>
                    <div>剩餘題目: {questionRemain}</div>
                    <div>花費時間: {timer}</div>
                </>
            )
        }else{
            return(
                <>
                </>
            )
        }
    }

    return(
        <div className='section status-bar' align="center" style={{backgroundColor: isBingoWaiting? "rgb(67, 247, 67)": "rgb(255, 255, 255)"}}>
            <div className='upper'>題目：{questionTown}</div>
            <div className='middle'>所選區域：{selectedTownName}</div>
            <GameModeInfo />
        </div>
    )
}

export default StatusBar