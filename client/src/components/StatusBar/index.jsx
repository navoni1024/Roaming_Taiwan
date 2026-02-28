import { useEffect } from 'react'
import GameModeInfo from './GameModeInfo'

//獨立出來單純是因為打錯字時除錯的巧合 對

const StatusBar = ({ gameMode, questionTown, selectedTownName, timer, questionsRemain, correctAnswerCount, wrongAnswerCount = 0, isBingoWaiting}) => {

    return(
        <div className='section status-bar' align="center" style={{backgroundColor: isBingoWaiting? "rgb(67, 247, 67)": "rgb(255, 255, 255)"}}>
            <div className='upper'>題目：{questionTown}</div>
            <div className='middle'>所選區域：{selectedTownName}</div>
            <GameModeInfo 
                gameMode={gameMode}
                timer={timer}
                correctAnswerCount={correctAnswerCount}
                questionsRemain={questionsRemain}
            />
        </div>
    )
}

export default StatusBar