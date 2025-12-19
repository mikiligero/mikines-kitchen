'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '@/lib/canvasUtils'
import { X, Check, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'

interface ImageCropperProps {
    imageSrc: string
    onCropComplete: (croppedBlob: Blob) => void
    onCancel: () => void
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onRotationChange = (rotation: number) => {
        setRotation(rotation)
    }

    const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation
            )
            if (croppedImage) {
                onCropComplete(croppedImage)
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Recortar Imagen</h3>
                    <button type="button" onClick={onCancel} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="relative flex-1 bg-zinc-900 min-h-[400px]">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={16 / 9}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onRotationChange={onRotationChange}
                        onCropComplete={onCropCompleteHandler}
                        showGrid={true}
                    />
                </div>

                <div className="p-4 space-y-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium w-16">Zoom</span>
                        <ZoomOut size={16} className="text-zinc-500" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-purple-600"
                        />
                        <ZoomIn size={16} className="text-zinc-500" />
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium w-16">Rotar</span>
                        <RotateCw size={16} className="text-zinc-500" />
                        <input
                            type="range"
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            aria-labelledby="Rotation"
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="flex-1 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-purple-600"
                        />
                        <span className="text-sm text-zinc-500 w-8 text-right">{rotation}°</span>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2"
                        >
                            <Check size={18} />
                            Confirmar Recorte
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
