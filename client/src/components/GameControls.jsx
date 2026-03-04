
const GameControls = ({
    gameActive, isResult, gamePause,
    startOnClick, pauseOnClick, exitOnClick, shareOnClick
    }) => {

    if(!gameActive){
        return(
            <div className="game-controls">
                <button onClick={startOnClick}>開始 !</button>
            </div>
        )
    }
    else {
        if(!isResult){
            return(
                <div className="game-controls">
                    <button onClick={pauseOnClick}>{gamePause ? '繼續' : '暫停' }</button>    
                    <button onClick={exitOnClick}>退出</button>
                </div>
            )
        }else{
            return(
                <div className="game-controls">
                    <button className="result" onClick={exitOnClick}>退至主畫面</button>
                    <button className="result" onClick={shareOnClick}>分享至頻道</button>
                </div>
            )
        }
    }
}

export default GameControls