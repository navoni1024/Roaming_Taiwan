
const GameControls = ({gameActive, isResult, startOnClick, pauseOnClick, exitOnclick}) => {
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
                    <button onClick={pauseOnClick}>暫停</button>    
                    <button onClick={exitOnclick}>退出</button>
                </div>
            )
        }else{
            return(
                <div className="game-controls">
                    <button onClick={exitOnclick}>退出</button>
                </div>
            )
        }
    }
}

export default GameControls