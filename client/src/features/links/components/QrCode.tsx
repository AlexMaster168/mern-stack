import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

interface Props {
  value: string
  size?: number
  fileName?: string
}

export function QrCode({ value, size = 160, fileName = 'qr.png' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)

  const download = () => {
    const canvas = wrapRef.current?.querySelector('canvas')
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = fileName
    a.click()
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={wrapRef} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
        <QRCodeCanvas value={value} size={size} level="M" />
      </div>
      <button type="button" onClick={download} className="text-sm text-indigo-600 hover:underline">
        Скачать PNG
      </button>
    </div>
  )
}
