import WaveSurfer from 'wavesurfer.js'
import ZoomPlugin from 'wavesurfer.js/dist/plugins/zoom.js'
import OverlayPlugin from '@/index'
import "./style.css"
import type { Position, ImageRendering } from '@/overlay'

const images = [
  { name: 'Harmonic Mel', file: './harmonic_mel.png' },
  { name: 'Pitch Contour', file: './pitch_contour.png' },
  { name: 'RMS Energy', file: './rms_energy.png' },
  { name: 'Onset Envelope', file: './onset_envelope.png' },
  { name: 'Tempogram', file: './tempogram.png' },
  { name: 'CQT', file: './cqt.png' },
  { name: 'Chromagram', file: './chromagram.png' },
  { name: 'Mel Spectrogram', file: './mel_spectrogram.png' },
  { name: 'Suzanne HQ', file: './suzannehq.png' },
  { name: 'Percussive Mel', file: './percussive_mel.png' },
  { name: 'MFCC', file: './mfcc.png' },
  { name: 'Tonnetz', file: './tonnetz.png' }
]

const tailwindScript = document.createElement('script')
tailwindScript.src = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'
tailwindScript.type = 'text/javascript'
// add tailiwind
document.querySelector<HTMLHeadElement>('head')?.appendChild(tailwindScript)

// Add dark mode script
const darkModeScript = document.createElement('script')
darkModeScript.textContent = `
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
`
document.head.appendChild(darkModeScript)

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="flex flex-col items-center justify-start h-screen w-screen">
  <div class="w-full max-w-4xl mx-auto p-4">
    <div class="flex flex-wrap lg:flex-wrap items-center gap-4 mb-4 max-w-4xl">

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Image:</label>
        <select id="imageSelect" class="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          ${images.map(img => `<option value="${img.file}">${img.name}</option>`).join('')}
        </select>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Position:</label>
        <select id="positionSelect" class="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <option value="overlay">Overlay</option>
          <option value="underlay">Underlay</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Rendering:</label>
        <select id="imageRenderingSelect" class="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <option value="auto">Auto</option>
          <option value="crisp-edges">Crisp Edges</option>
          <option value="pixelated">Pixelated</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Opacity:</label>
        <input type="range" id="opacityRange" min="0" max="1" step="0.1" value="1" 
               class="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer">
        <span id="opacityValue" class="text-sm text-gray-500 dark:text-gray-400 w-8">1</span>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Wave Color:</label>
        <input type="color" id="waveColorInput" value="#ff0000"
               class="w-8 h-8 p-0.5 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-800">
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Progress Color:</label>
        <input type="color" id="progressColorInput" value="#646464"
               class="w-8 h-8 p-0.5 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-800">
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Cursor Color:</label>
        <input type="color" id="cursorColorInput" value="#00ff00"
               class="w-8 h-8 p-0.5 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-800">
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Background:</label>
        <input type="color" id="backgroundColorInput" value="#ffffff"
               class="w-8 h-8 p-0.5 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-800">
      </div>

      <div class="flex items-center gap-2">
        <input type="checkbox" id="hideWaveformCheck" checked
               class="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-800">
        <label for="hideWaveformCheck" class="text-sm font-medium text-gray-700 dark:text-gray-300">Hide Waveform</label>
      </div>
      
    </div>

  
  </div>
   <div id="waveform" class="min-w-[1200px] min-h-[500px]"></div>
   </div>
   
`

const wavesurferOptions = {
  container: document.querySelector<HTMLDivElement>('#waveform')!,
  height: 500,
  minPxPerSec: 10,
  width: "1200px",
  url: "./suzanne.mp3",
  waveColor: 'rgba(255, 0, 0, 0.2)',
  progressColor: 'rgb(100, 100, 100)',
  cursorWidth: 3,
  cursorColor: "green",
  mediaControls: true,
  autoScroll: true,
  autoCenter: true,
  hideScrollbar: true,
}

let wavesurfer: WaveSurfer
let overlayPlugin: ReturnType<typeof OverlayPlugin.create>

function getOverlayOptions() {
  return {
    opacity: parseFloat((document.getElementById('opacityRange') as HTMLInputElement).value),
    position: (document.getElementById('positionSelect') as HTMLSelectElement).value as Position,
    hideWaveform: (document.getElementById('hideWaveformCheck') as HTMLInputElement).checked,
    imageRendering: (document.getElementById('imageRenderingSelect') as HTMLSelectElement).value as ImageRendering,
    backgroundColor: (document.getElementById('backgroundColorInput') as HTMLInputElement).value,
  }
}

function getWaveSurferOptions() {
  return {
    ...wavesurferOptions,
    waveColor: (document.getElementById('waveColorInput') as HTMLInputElement).value,
    progressColor: (document.getElementById('progressColorInput') as HTMLInputElement).value,
    cursorColor: (document.getElementById('cursorColorInput') as HTMLInputElement).value,
  }
}

function initWaveSurfer(imageUrl: string) {
  // Create WaveSurfer instance
  wavesurfer = WaveSurfer.create(getWaveSurferOptions())

  // Initialize overlay plugin with current options
  overlayPlugin = OverlayPlugin.create({
    imageUrl,
    ...getOverlayOptions(),
  })

  wavesurfer.registerPlugin(overlayPlugin)

  // Create and register zoom plugin
  const zoomPlugin = ZoomPlugin.create({
    maxZoom: 200,
    exponentialZooming: true,
  })
  wavesurfer.registerPlugin(zoomPlugin)
}

// Initialize with first image
initWaveSurfer("./harmonic_mel.png")

// Add event listeners for all controls
document.getElementById('imageSelect')?.addEventListener('change', (e) => {
  const select = e.target as HTMLSelectElement
  const newImageUrl = select.value
  console.log('Switching to image:', newImageUrl)
  wavesurfer.destroy()
  initWaveSurfer(newImageUrl)
})

document.getElementById('opacityRange')?.addEventListener('input', (e) => {
  const value = (e.target as HTMLInputElement).value
  document.getElementById('opacityValue')!.textContent = value
  wavesurfer.destroy()
  initWaveSurfer((document.getElementById('imageSelect') as HTMLSelectElement).value)
})

document.getElementById('positionSelect')?.addEventListener('change', () => {
  wavesurfer.destroy()
  initWaveSurfer((document.getElementById('imageSelect') as HTMLSelectElement).value)
})

document.getElementById('imageRenderingSelect')?.addEventListener('change', () => {
  wavesurfer.destroy()
  initWaveSurfer((document.getElementById('imageSelect') as HTMLSelectElement).value)
})

document.getElementById('hideWaveformCheck')?.addEventListener('change', () => {
  wavesurfer.destroy()
  initWaveSurfer((document.getElementById('imageSelect') as HTMLSelectElement).value)
})



document.getElementById('waveColorInput')?.addEventListener('change', () => {
  wavesurfer.destroy()
  initWaveSurfer((document.getElementById('imageSelect') as HTMLSelectElement).value)
})

document.getElementById('progressColorInput')?.addEventListener('change', () => {
  wavesurfer.destroy()
  initWaveSurfer((document.getElementById('imageSelect') as HTMLSelectElement).value)
})

document.getElementById('cursorColorInput')?.addEventListener('change', () => {
  wavesurfer.destroy()
  initWaveSurfer((document.getElementById('imageSelect') as HTMLSelectElement).value)
})


