import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

export default function Sidebar() {
  const [cells, setCells] = useState([])
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    axios.get(`${API}/cells`).then(r => setCells(r.data)).catch(() => setCells([5308, 5329]))
  }, [])

  const w = collapsed ? '64px' : '220px'

  return (
    <aside style={{
      width: w, minHeight: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      padding: '20px 12px',
      display: 'flex', flexDirection: 'column', gap: '6px',
      transition: 'width 0.3s ease', flexShrink: 0,
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'
    }}>

      {/* Logo Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', marginBottom: '28px' }}>
        {!collapsed && (
          <div>
            <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--cyan)', letterSpacing:'0.2em', textTransform:'uppercase' }}>⚡ BatteryOS</div>
            <div style={{ fontSize:'17px', fontWeight:700, color:'var(--text)', marginTop:'2px' }}>Dashboard</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          background:'var(--surface2)', border:'1px solid var(--border)',
          color:'var(--muted)', borderRadius:'6px', padding:'6px 8px',
          cursor:'pointer', fontSize:'14px', lineHeight:1,
        }}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav label */}
      {!collapsed && (
        <div style={{ fontSize:'10px', color:'var(--muted)', letterSpacing:'0.15em', textTransform:'uppercase', fontFamily:'var(--mono)', marginBottom:'4px' }}>
          Navigation
        </div>
      )}

      <NavLink to="/" end style={({ isActive }) => navStyle(isActive, collapsed)}>
        <span style={{ fontSize:'16px' }}>📊</span>
        {!collapsed && <span style={{ marginLeft:'10px' }}>Overview</span>}
      </NavLink>

      {!collapsed && (
        <div style={{ fontSize:'10px', color:'var(--muted)', letterSpacing:'0.15em', textTransform:'uppercase', fontFamily:'var(--mono)', margin:'16px 0 6px' }}>
          Cells
        </div>
      )}

      {cells.map(id => (
        <NavLink key={id} to={`/cell/${id}`} style={({ isActive }) => navStyle(isActive, collapsed)}>
          <span style={{ fontSize:'16px' }}>🔋</span>
          {!collapsed && <span style={{ marginLeft:'10px' }}>Cell {id}</span>}
        </NavLink>
      ))}

      {/* Footer */}
      {!collapsed && (
        <div style={{ marginTop:'auto', paddingTop:'20px', borderTop:'1px solid var(--border)' }}>
          <div style={{ fontSize:'11px', color:'var(--muted)', fontFamily:'var(--mono)' }}>Li-ion Monitor v1.0</div>
        </div>
      )}
    </aside>
  )
}

function navStyle(isActive, collapsed) {
  return {
    display: 'flex', alignItems: 'center',
    padding: collapsed ? '10px' : '10px 14px',
    borderRadius: '8px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    fontSize: '14px', fontWeight: isActive ? 600 : 400,
    color: isActive ? '#fff' : 'var(--text)',
    background: isActive ? 'var(--accent)' : 'transparent',
    transition: 'all 0.2s ease',
    boxShadow: isActive ? '0 0 12px var(--accent-glow)' : 'none',
  }
}
