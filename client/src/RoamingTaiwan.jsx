import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import { MapContainer } from 'react-leaflet/MapContainer'
import { GeoJSON } from 'react-leaflet/GeoJSON'
import mapdata from "./geojson/geo.json"
//import mapdata from "./geojson/twcounty2010.json"
import StatusBar from './components/StatusBar'

const RoamingTaiwan = () => {

    const DEBUG = true;

    let [isBingoWaiting, setIsBingoWaiting] = useState(0);
    let [selectedTownName, setSelectedTownName] = useState();
    let [randomQuetion, setRandomQuetion] = useState();
    let [score, setScore] = useState(0);

    //這裡好像是初始化
    useEffect(()=>{
        const keys = Object.keys(mapdata.features);
        const randIndex = Math.floor(Math.random() * keys.length);
        setRandomQuetion(randomQuetion=mapdata.features[randIndex].properties.TOWNNAME);
    },[]);


    const bingoAction = () => {
        const keys = Object.keys(mapdata.features);
        const randIndex = Math.floor(Math.random() * keys.length);
        setRandomQuetion(randomQuetion=mapdata.features[randIndex].properties.TOWNNAME);
        setScore(score=score+1);
        setSelectedTownName(selectedTownName="");
        setIsBingoWaiting(isBingoWaiting=0);
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
                if((randomQuetion===e.sourceTarget.feature.properties.TOWNNAME)&&(isBingoWaiting===0)){
                    setSelectedTownName(selectedTownName=e.sourceTarget.feature.properties.TOWNNAME);
                    setIsBingoWaiting(isBingoWaiting=1);
                    setTimeout(bingoAction,1000);
                }
                else if(isBingoWaiting===0){
                    setSelectedTownName(selectedTownName=e.sourceTarget.feature.properties.TOWNNAME);
                }
            }
        });
    }

    const mapStyle={
        weight: 1,
        fillOpacity: 1,
        fillColor: "rgb(128, 206, 197)",
        color: "rgb(230,230,230)",
    };

    const mapBound =[
        [26.504979796639104, 116.100698791452],
        [20.67667721806277, 125.49054604625438],
    ]

    return (
        <div className='container'>

            <MapContainer center={[23.6, 120.9738819]} zoom={7} minZoom={7} maxBounds={mapBound}>
                <GeoJSON style={mapStyle} data={mapdata} onEachFeature={mapFeature}></GeoJSON>
            </MapContainer>

            <StatusBar 
                randomQuetion={randomQuetion} 
                selectedTownName={selectedTownName}
                score={score}
                isBingoWaiting={isBingoWaiting}
            />

        </div>
    ); 
}

export default RoamingTaiwan;
