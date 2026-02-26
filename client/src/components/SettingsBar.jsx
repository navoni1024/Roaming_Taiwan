

const SettingsBar = ({onClick, isActive, onGameStart, isGameActive}) => {
    return(
        <div className="settings-bar">
            <p>SettingBar</p>
            <button onClick={onClick}>縣界{isActive ? '開' : '關'}</button>
            <button onClick={onGameStart}>遊戲{isGameActive ? '進行中' : '開始'}</button>
        </div>
    )
}

export default SettingsBar