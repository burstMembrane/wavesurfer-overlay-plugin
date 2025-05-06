import WaveSurfer from 'wavesurfer.js'
import ZoomPlugin from 'wavesurfer.js/dist/plugins/zoom.js'
import OverlayPlugin from '@/index'
import "./style.css"

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div id="waveform"></div>
  </div>
`
// Create WaveSurfer instance
const ws = WaveSurfer.create({
  container: document.querySelector<HTMLDivElement>('#waveform')!,
  height: 300,
  width: 1000,
  url: "./audio.mp3",
  waveColor: 'red',
  progressColor: 'rgb(100, 100, 100)',
  mediaControls: false,
  autoScroll: true,
  autoCenter: true,
  hideScrollbar: true,
})

// Initialize overlay plugin
let overlayPlugin = OverlayPlugin.create({
  imageUrl: "./demoassets/mel_spectrogram.png",
  opacity: 1,
  position: 'underlay',
  hideWaveform: false,
})

ws.registerPlugin(overlayPlugin)

// Create and register zoom plugin
const zoomPlugin = ZoomPlugin.create({
  maxZoom: 200,
  exponentialZooming: true,
})
ws.registerPlugin(zoomPlugin)

