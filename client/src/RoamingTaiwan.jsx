import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef} from 'react';
import { MapContainer } from 'react-leaflet/MapContainer'
import { GeoJSON } from 'react-leaflet/GeoJSON'
import mapdata from "./geojson/geo.json"
import countryGeoJson from "./geojson/twcounty2010.json"

import StatusBar from './components/StatusBar'
import SettingsBar from './components/SettingsBar';
import UserInfo from './components/UserInfo';

const RoamingTaiwan = () => {

    //const DEBUG = true;
    const isCountryBoundaryVisible = true;

    const [isBingoWaiting, setIsBingoWaiting] = useState(0);
    const [selectedTownName, setSelectedTownName] = useState();
    const [randomQuetion, setRandomQuetion] = useState();
    const [score, setScore] = useState(0);
    const questionRef = useRef(randomQuetion);

    const mapStyle={
        weight: 1,
        fillOpacity: 1,
        fillColor: "rgb(128, 206, 197)",
        color: "rgb(230,230,230)",
    };

    const countryBoundaryStyle = {
        weight: 1.2,
        opacity: 1,
        fillOpacity: 0,
        color: "rgb(1,1,1)",
        interactive: false
    }

    const mapBound =[
        [26.504979796639104, 116.100698791452],
        [20.67667721806277, 125.49054604625438],
    ]

    //這裡好像是初始化
    useEffect(()=>{
        const keys = Object.keys(mapdata.features);
        const randIndex = Math.floor(Math.random() * keys.length);
        setRandomQuetion(mapdata.features[randIndex].properties.TOWNNAME);
    },[]);

    useEffect(()=>{
        questionRef.current = randomQuetion;
    },[randomQuetion]);

    const bingoAction = () => {
        const keys = Object.keys(mapdata.features);
        const randIndex = Math.floor(Math.random() * keys.length);
        setRandomQuetion(mapdata.features[randIndex].properties.TOWNNAME);
        setScore(prev => prev + 1);
        setSelectedTownName("");
        setIsBingoWaiting(0);
    }

    const mapFeature=(country, layer)=>{
        layer.on({
            
            mouseover: (e) => {
                e.target.setStyle({
                    fillOpacity: 0.5,
                });
            },

            mouseout: (e) => {
                e.target.setStyle({
                    fillOpacity: 1,
                });
            },

            click: (e) => {
                if((questionRef.current===e.sourceTarget.feature.properties.TOWNNAME)&&(isBingoWaiting===0)){
                    setSelectedTownName(e.sourceTarget.feature.properties.TOWNNAME);
                    setIsBingoWaiting(1);
                    setTimeout(bingoAction,1000);
                }
                else if(isBingoWaiting===0){
                    setSelectedTownName(e.sourceTarget.feature.properties.TOWNNAME);
                }
            }
        });
    }

    return (
        <div className='container'>
            <MapContainer center={[23.6, 120.9738819]} zoom={7} minZoom={7} maxBounds={mapBound}>
                <GeoJSON style={mapStyle} data={mapdata} onEachFeature={mapFeature}></GeoJSON>
                <GeoJSON style={countryBoundaryStyle} data={countryGeoJson} />
            </MapContainer>
            <div className='sidebar'>
                <UserInfo />
                <StatusBar 
                    randomQuetion={randomQuetion} 
                    selectedTownName={selectedTownName}
                    score={score}
                    isBingoWaiting={isBingoWaiting}
                />
                <SettingsBar />
            </div>
        </div>
    ); 
}

export default RoamingTaiwan;
