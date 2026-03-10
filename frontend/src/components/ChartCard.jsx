export default function ChartCard({ title, accent = 'var(--cyan)', children, stat, statLabel }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: '14px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top glow bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background: accent, borderRadius:'14px 14px 0 0' }} />
      
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:'11px', color: accent, letterSpacing:'0.1em', textTransform:'uppercase' }}>
          {title}
        </div>
        {stat !== undefined && (
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'20px', fontWeight:700, color: accent }}>{stat}</div>
            {statLabel && <div style={{ fontSize:'10px', color:'var(--muted)', fontFamily:'var(--mono)' }}>{statLabel}</div>}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
