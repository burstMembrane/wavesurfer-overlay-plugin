import type WaveSurfer from 'wavesurfer.js'
import createElement from 'wavesurfer.js/dist/dom.js'
import { BasePlugin } from 'wavesurfer.js/dist/base-plugin.js'

/**
 * Events that can be emitted by the OverlayPlugin
 */
export type OverlayPluginEvents = {
    /** Emitted when the overlay is ready and rendered */
    ready: []
    /** Emitted when the plugin is destroyed */
    destroy: []
}

/** Position of the overlay relative to the waveform */
export type Position = "overlay" | "underlay"

export type ImageRendering = "crisp-edges" | "pixelated" | "auto"
/**
 * Configuration options for the OverlayPlugin
 */
export interface OverlayPluginOptions {
    /** URL or array of URLs for the overlay image(s) */
    imageUrl: string | string[]
    /** Container element or selector string for the overlay */
    container?: HTMLElement | string
    /** Background color of the overlay container */
    backgroundColor?: string
    /** Duration of the audio in seconds (if not provided, will use WaveSurfer's duration) */
    duration?: number
    /** Opacity value(s) for the overlay image(s) (0-1) */
    opacity?: number | number[]
    /** Position of the overlay relative to the waveform ('overlay' or 'underlay') */
    position?: Position
    /** Whether to hide the waveform */
    hideWaveform?: boolean
    /** Rendering mode for the overlay image(s) */
    imageRendering?: ImageRendering
}

/**
 * WaveSurfer plugin that renders images as overlay or underlay to the waveform
 * 
 * @example
 * ```js
 * // Single image overlay
 * wavesurfer.registerPlugin(
 *   OverlayPlugin.create({
 *     imageUrl: './spectogram.png',
 *     opacity: 0.8,
 *     position: 'overlay'
 *   })
 * );
 * 
 * // Multiple image layers with different opacities
 * wavesurfer.registerPlugin(
 *   OverlayPlugin.create({
 *     imageUrl: ['./pitch.png', './spectrum.png'],
 *     opacity: [0.8, 0.6],
 *     position: 'underlay'
 *   })
 * );
 * ```
 */
export class OverlayPlugin extends BasePlugin<OverlayPluginEvents, OverlayPluginOptions> {
    /** Subscriptions to WaveSurfer events */
    protected subscriptions: (() => void)[] = []
    /** Container element for the overlay */
    private overlayWrapper: HTMLElement
    /** Loaded image elements */
    private images: HTMLImageElement[] = []

    /**
     * Creates an instance of OverlayPlugin
     * @param options - Configuration options
     */
    constructor(options: OverlayPluginOptions) {
        super(options)
        this.overlayWrapper = this.initOverlayWrapper()
        this.loadImages()
    }

    /**
     * Creates the wrapper element for overlays
     * @returns The created wrapper element
     */
    private initOverlayWrapper(): HTMLElement {
        return createElement('div', { part: 'overlay-wrapper', style: { pointerEvents: 'none' } })
    }

    /**
     * Loads all images from URLs provided in options
     */
    private loadImages(): void {
        const imageUrls = Array.isArray(this.options.imageUrl)
            ? this.options.imageUrl
            : [this.options.imageUrl];

        this.images = imageUrls.map(url => {
            const img = new Image()
            img.src = url
            return img
        })
    }

    /**
     * Factory method to create a new OverlayPlugin instance
     * @param options - Configuration options
     * @returns A new OverlayPlugin instance
     */
    public static create(options?: OverlayPluginOptions) {
        if (!options) {
            throw Error('OverlayPlugin options are required')
        }
        console.log('Creating OverlayPlugin with options:', options)
        return new OverlayPlugin(options)
    }

    /**
     * Initializes the overlay layers
     */
    private initOverlay() {
        const duration = this.wavesurfer?.getDuration() ?? this.options?.duration ?? 0
        const pxPerSec = (this.wavesurfer?.getWrapper().scrollWidth || this.overlayWrapper.scrollWidth) / duration
        const totalWidth = duration * pxPerSec

        const position = this.options.position || "overlay"
        const isUnderlay = position === "underlay"
        this.overlayWrapper.innerHTML = ''

        let opacities: number[] = []
        if (Array.isArray(this.options.opacity)) {
            opacities = this.options.opacity
        } else {
            const defaultOpacity = this.options.opacity || 0.3
            opacities = this.images.map(() => defaultOpacity)
        }

        while (opacities.length < this.images.length) {
            opacities.push(opacities[opacities.length - 1] || 0.3)
        }

        this.images.forEach((image, index) => {
            const overlay = createElement('div', {
                style: {
                    imageRendering: this.options.imageRendering || "auto",
                    backgroundImage: `url(${image.src})`,
                    backgroundPosition: '0 0',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: `${totalWidth}px 100%`,
                    width: `${totalWidth}px`,
                    height: `100%`,
                    overflow: 'hidden',
                    backgroundColor: index === 0 ? (this.options.backgroundColor || "transparent") : "transparent",
                    whiteSpace: 'nowrap',
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    zIndex: isUnderlay ? `-${5 + index}` : `${200 + index}`,
                    opacity: String(opacities[index]),
                },
            })

            overlay.setAttribute('part', `overlay-layer-${index}`)
            this.overlayWrapper.appendChild(overlay)
        })

        if (this.wavesurfer) {
            const waveWrapper = this.wavesurfer.getWrapper()

            if (isUnderlay) {
                waveWrapper.style.position = 'relative'
                waveWrapper.style.zIndex = '100'
                const waveElements = waveWrapper.querySelectorAll('[part="wave"], canvas')
                waveElements.forEach((element) => {
                    const el = element as HTMLElement
                    el.style.position = 'relative'
                    el.style.zIndex = '150'
                })
            }

            const cursorElements = waveWrapper.querySelectorAll('.wavesurfer-cursor, [part="cursor"]')
            cursorElements.forEach((element) => {
                const el = element as HTMLElement
                el.style.position = 'absolute'
                el.style.zIndex = '300'
            })
        }

        if (this.wavesurfer) {
            this.subscriptions.push(
                this.wavesurfer.on('zoom', (minPxPerSec) => {
                    const newWidth = duration * minPxPerSec
                    Array.from(this.overlayWrapper.children).forEach(child => {
                        const el = child as HTMLElement
                        el.style.width = `${newWidth}px`
                        el.style.backgroundSize = `${newWidth}px 100%`
                    })
                })
            )

            this.subscriptions.push(
                this.wavesurfer.on('redraw', () => {
                    const waveWrapper = this.wavesurfer?.getWrapper()
                    if (waveWrapper) {
                        const cursorElements = waveWrapper.querySelectorAll('.wavesurfer-cursor, [part="cursor"]')
                        cursorElements.forEach((element) => {
                            const el = element as HTMLElement
                            el.style.position = 'absolute'
                            el.style.zIndex = '300'
                        })
                    }
                })
            )
        }

        this.emit('ready')
    }

    /**
     * Called when wavesurfer is initialized
     * @internal
     */
    protected onInit() {
        if (!this.wavesurfer) {
            throw Error('WaveSurfer is not initialized')
        }

        let container = this.wavesurfer.getWrapper()
        if (this.options.container instanceof HTMLElement) {
            container = this.options.container
        } else if (typeof this.options.container === 'string') {
            const el = document.querySelector(this.options.container)
            if (!el) throw Error(`No container found matching ${this.options.container}`)
            container = el as HTMLElement
        }
        container.appendChild(this.overlayWrapper)

        this.subscriptions.push(
            this.wavesurfer.on('ready', () => {
                this.initOverlay()
                if (!this.wavesurfer) return

                this.subscriptions.push(
                    this.wavesurfer.on('redraw', () => this.initOverlay())
                )
            })
        )

        if (this.options.hideWaveform) {
            const prevOptions = this.wavesurfer?.options

            this.wavesurfer?.setOptions({
                ...prevOptions,
                waveColor: 'transparent',
            })
        }
        return
    }

    /**
     * Called by WaveSurfer to initialize the plugin
     * @param wavesurfer - WaveSurfer instance
     * @internal
     */
    public _init(wavesurfer: WaveSurfer) {
        this.wavesurfer = wavesurfer
        this.onInit()
    }

    /**
     * Destroys the plugin and releases resources
     */
    public destroy() {
        this.emit('destroy')
        this.subscriptions.forEach((unsubscribe) => unsubscribe())
        this.overlayWrapper.remove()
        // remove all images from the overlay wrapper
        this.overlayWrapper.innerHTML = ''
    }
}

export default OverlayPlugin
