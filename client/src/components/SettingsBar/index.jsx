

const SettingsBar = ({onClick, isActive, onGameStart, isGameActive}) => {
    return(
        <div className="section settings-bar">
            <ul>
                <li>
                    <span>遊戲模式:</span>
                    <select id="gamemode-select">
                        <option value="">請選擇模式^^</option>
                        <option value="timeLimit">限時答題</option>
                        <option value="questionsComplete">指定題數</option>
                    </select>
                </li>  
                <li>
                    <span>遊戲時間:</span>
                    <button onClick={onClick}>{isActive ? '開' : '關'}</button>
                </li>
                <li>
                    <span>允許重複題目:</span>
                    <button onClick={onClick}>{isActive ? '開' : '關'}</button>
                </li>
                <li>
                    <span>顯示已答對區域:</span>
                    <button onClick={onClick}>{isActive ? '開' : '關'}</button>
                </li>  
                <li>
                    <span>顯示完整題目(縣市):</span>
                    <button onClick={onClick}>{isActive ? '開' : '關'}</button>
                </li>
                <li>
                    <span>顯示縣界:</span>
                    <button onClick={onClick}>{isActive ? '開' : '關'}</button>
                </li>  
            </ul>
        </div>
    )
}

export default SettingsBar;