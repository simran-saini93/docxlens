import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt     = 'DocxLens — Compare Documents Side by Side'
export const size    = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background:     'linear-gradient(135deg, #000000 0%, #0a0a1a 50%, #000820 100%)',
          width:          '100%',
          height:         '100%',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          fontFamily:     'sans-serif',
          position:       'relative',
        }}
      >
        {/* Glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(29,78,216,0.25) 0%, transparent 70%)',
        }} />

        {/* Logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '56px', height: '56px', background: '#1d4ed8',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
            </svg>
          </div>
          <span style={{ fontSize: '36px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px' }}>
            DocxLens
          </span>
        </div>

        {/* Headline */}
        <div style={{
          fontSize: '64px', fontWeight: 900, color: '#ffffff',
          textAlign: 'center', lineHeight: 1.1, letterSpacing: '-2px',
          marginBottom: '20px', maxWidth: '900px',
        }}>
          Compare documents{' '}
          <span style={{ color: '#60a5fa' }}>side by side.</span>
        </div>

        {/* Subtext */}
        <div style={{
          fontSize: '24px', color: '#71717a', textAlign: 'center', maxWidth: '700px',
        }}>
          PDF · Word · Excel · JSON · Code — Free, private, no signup
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '36px' }}>
          {['Up to 5 docs', '100% Private', 'OCR Support', 'Free Forever'].map((label) => (
            <div key={label} style={{
              padding: '8px 18px', borderRadius: '999px',
              background: 'rgba(29,78,216,0.15)', border: '1px solid rgba(29,78,216,0.4)',
              color: '#93c5fd', fontSize: '16px', fontWeight: 600,
            }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}