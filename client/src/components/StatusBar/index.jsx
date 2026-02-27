

const StatusBar = ({ questionTown, selectedTownName, timer, correctAnswerCount = 0, wrongAnswerCount = 0, isBingoWaiting}) => {
    return(
        <div className='section status-bar' align="center" style={{backgroundColor: isBingoWaiting? "rgb(67, 247, 67)": "rgb(255, 255, 255)"}}>
            <div className='upper'>題目：{questionTown}</div>
            <div className='middle'>所選區域：{selectedTownName}</div>
            <div className='middle'>{timer}秒</div>
            <div className='score'>答題情況: <b>{correctAnswerCount}</b></div>
        </div>
    )
}

export default StatusBar