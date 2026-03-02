import 'leaflet/dist/leaflet.css';
import { useState , useEffect , useRef } from 'react';
import { MapContainer } from 'react-leaflet/MapContainer'
import { GeoJSON } from 'react-leaflet/GeoJSON'
import mapdata from "../geojson/TW_town_WGS84_precision_6_simplfy_35.json"
import countryGeoJson from "../geojson/TW_county_WGS84_precision_6_simplfy_35.json"

import useSound from "use-sound";
import clickSound from "../assets/click.mp3"
import finishSound from "../assets/windows-31-startup-sound.mp3"


const RoamingTaiwanMap = ({
    gameActive, gamePause, isResult, gameMode, isBingoWaiting, 
    
    showFullQuestion, showCountryBoundary, showAnsweredArea,
    
    correctHistory, wrongHistory, 
    
    setCurrentClickProperties, setQuestionsBank, 
}) => {
    
    //sound

    const [playClickSound] = useSound(clickSound, {volume: 1.2});
    const [playFinishSound] = useSound(finishSound, {volume: 0.6});

    //ref for leaflet

    const gameActiveRef = useRef(gameActive);
    const gamePauseRef = useRef(gamePause);
    const isResultRef = useRef(isResult);
    const modeRef = useRef('');
    const isBingoWaitingRef = useRef(isBingoWaiting);
    const showFullQuestionRef = useRef(showFullQuestion);

    useEffect(() => {
        modeRef.current = gameMode;
        showFullQuestionRef.current = showFullQuestion;
        gameActiveRef.current = gameActive;
        gamePauseRef.current = gamePause;
        isResultRef.current = isResult;
        isBingoWaitingRef.current = isBingoWaiting;
    },[gameActive, gameMode, gamePause, isResult, isBingoWaiting]);

    useEffect(() => {
        if(mapdata !== undefined){
            setQuestionsBank(mapdata.features)
        }
    }, [mapdata])

    const defaultMapStyle={
        weight: 1,
        fillOpacity: 1,
        fillColor: "rgb(128, 206, 197)",
        color: "rgb(230,230,230)",
    };

    const defaultCountryBoundaryStyle = {
        weight: 1,
        opacity: 1,
        fillOpacity: 0,
        color: "rgb(1,1,1)",
        interactive: false
    }

    const mapBound =[
        [26.504979796639104, 116.100698791452],
        [20.67667721806277, 125.49054604625438],
    ]

    const [mapStyle, setMapStyle] = useState(defaultMapStyle);
    const [countryBoundaryStyle, setCountryBoundaryStyle] = useState(defaultCountryBoundaryStyle);

    /*
    const mapDataTownNameSet = useMemo(() => {
        const townNameSet = new Set();
        mapdata.features.forEach( (feature) => {
            townNameSet.add(feature.properties.TOWNNAME);
        });
        console.log(townNameSet);
        return townNameSet;
    }, [mapdata]) 
    */

    //地圖的初始化邏輯

    useEffect( () => {
        if(gameActive){
            if(isResult){
                //到結束畫面
                const updated = wrongHistory.map(item => item.TOWNID);
                const cleanedWrongHistory = [...new Set(updated)]; //去除重複值 愛set
                playFinishSound();
                setWrongTownIdArray(cleanedWrongHistory);
                    
            }else{
                setQuestionsBank(mapdata.features)
                //遊戲初始化
                if(gameMode==='timeLimit'){
                    return;   
                }
                if(gameMode==='questionsComplete'){
                    return;
                }
            }

        }else{
            //到開始畫面
            handleMapReset();
        }
    }, [gameActive, isResult]);

    const handleMapReset = () => {
        setCorrectTownIdArray([]);
        setWrongTownIdArray([]);
        showStatusRef.current = [{TOWNID: '', fillOpacity: 0, fillColor: 'rgb(255 ,255, 255)'}]
    };

    useEffect (() => {
        if(gamePauseRef.current){
            setMapStyle({
                weight: 1,
                fillOpacity: 1,
                fillColor: "rgb(106, 106, 106)",
                color: "rgb(230,230,230)",
                interactive: false,
                bubblingMouseEvents: false,
            });
        }else{
            setMapStyle(defaultMapStyle);
        }
    }, [gamePause])

    useEffect( () => {
        if(showCountryBoundary){
            setCountryBoundaryStyle({
                weight: 1,
                opacity: 1,
                fillOpacity: 0,
                color: "rgb(1,1,1)",
                interactive: false
            })
        }else{
            setCountryBoundaryStyle({
                weight: 0,
                opacity: 0,
                fillOpacity: 0,
                color: "rgb(1,1,1)",
                interactive: false
            })
        }
    }, [showCountryBoundary])

    //互動的地圖
    const mapFeature=(country, layer)=>{
        layer.on({
            mouseover: (e) => {
                if(gamePauseRef.current) return;    //直接這樣硬插好像蠻暴力 但試了很多只有這樣能阻止互動
                e.target.setStyle({
                    fillOpacity: 0.5,
                });
            },

            mouseout: (e) => {
                if(gamePauseRef.current) return;
                e.target.setStyle({
                    fillOpacity: 1,
                });
            },

            click: (e) => {
                //playClickSound();
                setCurrentClickProperties(e);
            }
        });
    }

    //  顯示答題相關的地圖
    //  感覺問題沒多到那樣就先暴力解好了

    /*
        該圖層狀態
        { TOWNID : status}
        status: 0 無色
        status: 1 對過
        status: 2 錯過
        status: 3 重複    
    */

    //先用ref做做看的statusStyle邏輯

    const [correctTownIdArray, setCorrectTownIdArray] = useState([]);
    const [wrongTownIdArray, setWrongTownIdArray]= useState([]);
    const [updatedStatusArray, setUpdatedStatusArray] = useState([]);
    const showStatusRef = useRef([])

    useEffect(() => {
        showStatusRef.current = updatedStatusArray;
    }, [updatedStatusArray])

    //等畫面結束完的事件處理跑完wrongHistory才觸發
    useEffect(() => {
        if(showAnsweredArea || isResult){
            updateShowStatusStyle();
        }
    }, [correctTownIdArray, wrongTownIdArray])


    useEffect(() => {
        if(gameActive && correctHistory != undefined){
            const updated = correctHistory.map(item => item.TOWNID);
            setCorrectTownIdArray(updated);
        }
    },[correctHistory])

    /*  
    //整合到自己的isResult理了
    useEffect(() => {  
        if(gameActive){
            const updated = wrongHistory.map(item => item.TOWNID);
            setWrongTownIdArray(updated);
        }
    },[wrongHistory])
    */

    //  顯示答題相關的地圖


    const showStatusStyle = (features) => {
        const currentTownId = features.properties.TOWNID;
        const foundState = showStatusRef.current.find(obj => obj.TOWNID === currentTownId);
        if(foundState !== undefined){
            return {
                'fillOpacity': foundState.fillOpacity,
                'fillColor': foundState.fillColor,
                'weight': 0,
                'opacity': 0,
                'interactive': false
            }
        }else{
            return {'fillOpacity': 0,'weight': 0, 'opacity': 0, 'interactive': false};
        }
    }

    const updateShowStatusStyle = () => {
        if(!gameActive){return null}; //暫時先這樣

        const townIdStatusObj = {};

        correctTownIdArray.forEach( (id) => {
            townIdStatusObj[id] = 1;
        });

        wrongTownIdArray.forEach( (id) => {
            if( townIdStatusObj[id] !== undefined){
                townIdStatusObj[id] = townIdStatusObj[id] + 1;
            }else{
                townIdStatusObj[id] = 2;
            }
        })

        let townIdStatusArray = Object.entries(townIdStatusObj);
        let processedStatusArray = []

        townIdStatusArray.forEach((status) => {
            const townId = status[0];
            const state = status[1];

            switch(state){
                    case 1:
                        processedStatusArray.push({TOWNID: townId, fillOpacity: 0.5, fillColor: 'rgb(0 ,255, 0)'}) 
                        break;
                    case 2:
                        processedStatusArray.push({TOWNID: townId, fillOpacity: 0.5, fillColor: 'rgb(255 ,0, 0)'})
                        break;
                    case 3:
                        processedStatusArray.push({TOWNID: townId, fillOpacity: 0.5, fillColor: 'rgb(255 ,255, 0)'})
                        break;
            }
        })

        setUpdatedStatusArray(processedStatusArray);
    }

    return(
        <>
            <MapContainer center={[23.6, 120.9738819]} zoom={7} minZoom={7} zoomDelta={0.5} zoomSnap={0.5} wheelPxPerZoomLevel={120} zoomAnimation={true} zoomAnimationThreshold={4} maxBounds={mapBound} preferCanvas={true}>
                <GeoJSON style={mapStyle} data={mapdata} onEachFeature={mapFeature}></GeoJSON>
                <GeoJSON style={countryBoundaryStyle} data={countryGeoJson} />
                <GeoJSON style={showStatusStyle} data={mapdata} />
            </MapContainer>            
        </>
    )
}

export default RoamingTaiwanMap;