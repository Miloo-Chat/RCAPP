import { useEffect, useState } from 'react'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || ''

export default function LiveCount({ color }) {
  const [count, setCount] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      if (typeof document !== 'undefined' && document.hidden) return
      try {
        const res = await fetch(`${SERVER_URL}/api/health`)
        if (!res.ok) throw new Error('bad status')
        const data = await res.json()
        if (active && typeof data.onlineUsers === 'number') setCount(data.onlineUsers)
      } catch {
        if (active) setCount(null)
      }
    }
    load()
    const id = setInterval(load, 30000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  if (count === null || count <= 0) return null

  const label = String(count).padStart(4, '0')

  return (
    <div
      aria-label={`${count} people online now`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        letterSpacing: '0.04em',
        color: color || 'inherit',
        opacity: 0.9,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#3fae6a',
          boxShadow: '0 0 0 3px rgba(63,174,106,0.18)',
        }}
      />
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{label}</span>
      <span>birds here now</span>
    </div>
  )
}
