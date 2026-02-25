//import { useState } from 'react'
//import { ThemeProvider } from 'styled-components'
//import themes from "./themes"
import './App.css'
import RoamingTaiwan from './RoamingTaiwan'


//const defaultTheme = Object.keys(themes)[0];

const App = () => {
  //const [selectedTheme, setSelectedTheme] = useState(defaultTheme);

  return(
    //<ThemeProvider theme={themes[selectedTheme]}>
      <RoamingTaiwan />
    //</ThemeProvider>
  )
}

export default App
