import SkyBackground from './SkyBackground.jsx'
import Sun from './Sun.jsx'
import Moon from './Moon.jsx'
import Clouds from './Clouds.jsx'
import Hills from './Hills.jsx'
import Fog from './Fog.jsx'
import Precipitation from './Precipitation.jsx'
import Lightning from './Lightning.jsx'

// All background layers, back to front.
export default function Scene({ sky }) {
  return (
    <div className="scene" aria-hidden="true">
      <SkyBackground colors={sky.colors} starOpacity={sky.starOpacity} />
      <Moon {...sky.moon} />
      <Sun {...sky.sun} />
      <Clouds level={sky.cloudLevel} tint={sky.cloudTint} cover={sky.cover} body={sky.body} deckOpacity={sky.deckOpacity} />
      <Hills color={sky.hill} />
      <Fog active={sky.fog} />
      <Precipitation type={sky.precip.type} intensity={sky.precip.intensity} />
      <Lightning active={sky.storm} />
    </div>
  )
}
