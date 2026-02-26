

const StatusBar = ({ randomQuetion, selectedTownName, timeLeft, score, isBingoWaiting}) => {
    return(
        <div className='status-bar' align="center" style={{backgroundColor: isBingoWaiting? "rgb(67, 247, 67)": "rgba(204, 204, 204, 0.457)"}}>
            <div className='upper'>題目：{randomQuetion}</div>
            <div className='middle'>所選擇的區域：{selectedTownName}</div>
            <div className='middle'>{timeLeft}秒</div>
            <div className='score'>分數：<b>{score}</b></div>
        </div>
    )
}

export default StatusBar