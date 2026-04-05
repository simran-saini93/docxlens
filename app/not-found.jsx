export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#000', color: '#fff', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '64px', fontWeight: 900 }}>404</div>
        <div style={{ fontSize: '18px', color: '#71717a' }}>Page not found</div>
        <a href="/" style={{ marginTop: '8px', padding: '10px 24px', background: '#1d4ed8', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
          Back to DocxLens
        </a>
      </body>
    </html>
  )
}