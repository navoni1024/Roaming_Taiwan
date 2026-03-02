import { useEffect } from 'react'
import GameModeInfo from './GameModeInfo'
import banner from '../../assets/Roaming_Taiwan_Banner.png';
import resultBanner from '../../assets/1057.gif';

const StatusBar = ({ isResult, gameActive, gameMode, questionTown, selectedTownName, timer, gameTime, questionsRemain, questionsCount, correctAnswerCount = 0, wrongAnswerCount = 0, isBingoWaiting}) => {

    const GameModeResult = () => {
        if(gameMode==='timeLimit'){
            return(
                <>
                    <tr>
                        <td>遊戲模式: </td>
                        <td style={{float: 'right'}}>限時</td>
                    </tr>
                    <tr>
                        <td>遊戲時間: </td>
                        <td style={{float: 'right'}}>{gameTime} 秒</td>
                    </tr>
                    <tr>
                        <td>回答正確: </td>
                        <td style={{float: 'right'}}>{correctAnswerCount}</td>
                    </tr>
                    
                </>
            )
        }

        if(gameMode==='questionsComplete'){
            return(
                <>
                    <tr>
                        <td>遊戲模式: </td>
                        <td style={{float: 'right'}}>計時</td>
                    </tr>
                    <tr>
                        <td>題目數量: </td>
                        <td style={{float: 'right'}}>{questionsCount}</td>
                    </tr>
                    <tr>
                        <td>花費時間: </td>
                        <td style={{float: 'right'}}>{timer} 秒</td>
                    </tr>
                </>
            )
        }
    }

    const correctRate = ((correctAnswerCount + wrongAnswerCount ) > 0) ? ((correctAnswerCount / (correctAnswerCount+wrongAnswerCount))*100).toFixed(1) : 0;


    if(!gameActive&&!isResult){
        return(
            <div className='section status-bar' align="center" style={{backgroundColor: isBingoWaiting? "rgb(67, 247, 67)": "rgb(255, 255, 255)"}}>
                <img src={banner} alt="banner" style={{height: 60}}/>
                <div className='middle'>{selectedTownName!==''?'所選區域:':'點擊地區查看資訊~'} {selectedTownName}</div>
            </div>
        )
    }

    if(gameActive&&!isResult){
        return(
            <div className='section status-bar' align="center" style={{backgroundColor: isBingoWaiting? "rgb(67, 247, 67)": "rgb(255, 255, 255)"}}>
                <div className='upper'>題目: {questionTown}</div>
                <div className='middle'>所選區域: {selectedTownName}</div>
                <GameModeInfo 
                    gameMode={gameMode}
                    timer={timer}
                    correctAnswerCount={correctAnswerCount}
                    questionsRemain={questionsRemain}
                />
            </div>
        )
    }

    if(gameActive&&isResult){
        return(
            <div className='section status-bar' align="center" style={{backgroundColor: isBingoWaiting? "rgb(67, 247, 67)": "rgb(255, 255, 255)"}}>
                <span>
                    <img src={resultBanner} alt="resultBanner" style={{height: 35}}/>
                    <span><b>遊戲結束 !</b></span>
                </span>
                <table style={{width: '80%', fontSize: 15}}>
                    <tbody>
                        <GameModeResult/>
                        <tr>
                            <td>正確 / 總數:</td>
                            <td style={{float: 'right'}}>{correctAnswerCount} / {correctAnswerCount + wrongAnswerCount}</td>
                        </tr>
                        <tr>
                            <td>正確率:</td>
                            <td style={{float: 'right'}}>{correctRate} %</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }

    
}

export default StatusBar