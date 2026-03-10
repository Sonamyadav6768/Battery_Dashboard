import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ChartCard from '../components/ChartCard'

const API = 'http://localhost:8000'

const CELL_COLORS = { 5308: '#3b82f6', 5329: '#06b6d4' }

export default function Dashboard() {
  const [cells, setCells] = useState([])
  const [sohMap, setSohMap] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`${API}/cells`).then(async r => {
      const list = r.data
      setCells(list)
      const map = {}
      for (const id of list) {
        const s = await axios.get(`${API}/soh/${id}`)
        map[id] = s.data.soh
      }
      setSohMap(map)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div style={{ padding: '40px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--cyan)', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'10px' }}>
          ⚡ Live Overview
        </div>
        <h1 style={{ fontSize: '34px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>
          Battery Data Dashboard
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '10px', fontSize: '15px', lineHeight: 1.6 }}>
          Real-time State of Health monitoring for Li-ion cells · {cells.length} cells active
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'16px', marginBottom:'36px' }}>
        {cells.map(id => (
          <div key={id} onClick={() => navigate(`/cell/${id}`)} style={{
            background: 'var(--surface)', border: `1px solid ${CELL_COLORS[id] || 'var(--border)'}33`,
            borderRadius: '12px', padding: '18px 20px', cursor: 'pointer',
            transition: 'all 0.2s', position:'relative', overflow:'hidden'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--surface2)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--surface)'}
          >
            <div style={{ fontSize:'11px', color:'var(--muted)', fontFamily:'var(--mono)', marginBottom:'8px' }}>CELL {id}</div>
            <div style={{ fontSize:'28px', fontWeight:800, color: CELL_COLORS[id] || 'var(--cyan)' }}>{sohMap[id]}%</div>
            <div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'4px' }}>State of Health</div>
            <div style={{
              position:'absolute', top:0, right:0, bottom:0, width:'4px',
              background: CELL_COLORS[id] || 'var(--cyan)', borderRadius:'0 12px 12px 0'
            }}/>
          </div>
        ))}
      </div>

      {/* SoH Pie Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'24px' }}>
        {cells.map(id => {
          const soh = sohMap[id] ?? 0
          const rem = parseFloat((100 - soh).toFixed(2))
          const color = CELL_COLORS[id] || '#3b82f6'
          return (
            <ChartCard key={id} title={`State of Health — Cell ${id}`} accent={color}
              stat={`${soh}%`} statLabel="SoH">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={[{name:'SoH',value:soh},{name:'Degraded',value:rem}]}
                    cx="50%" cy="50%" innerRadius={65} outerRadius={100}
                    dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                    <Cell fill={color} />
                    <Cell fill="var(--border)" />
                  </Pie>
                  <Tooltip formatter={v => `${v}%`} contentStyle={{
                    background:'var(--surface2)', border:'1px solid var(--border)',
                    borderRadius:'8px', color:'var(--text)', fontSize:'12px'
                  }}/>
                  <Legend formatter={v => <span style={{ color:'var(--muted)', fontSize:'12px' }}>{v}</span>}/>
                </PieChart>
              </ResponsiveContainer>
              <button onClick={() => navigate(`/cell/${id}`)} style={{
                background: `${color}22`, border:`1px solid ${color}44`,
                color: color, borderRadius:'8px', padding:'8px 16px',
                cursor:'pointer', fontSize:'13px', fontWeight:600,
                transition:'all 0.2s', width:'100%'
              }}>
                View Cell {id} Details →
              </button>
            </ChartCard>
          )
        })}
      </div>

      {/* About section */}
      <div style={{
        marginTop: '36px', background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:'14px', padding:'28px 32px'
      }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--green)', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'14px' }}>
          About This Project
        </div>
        <p style={{ color:'var(--muted)', fontSize:'14px', lineHeight:1.8 }}>
          This dashboard visualizes the performance of Li-ion battery cells. 
          State of Health (SoH) is calculated as the ratio of measured discharge capacity 
          to nominal capacity (3000 mAh), expressed as a percentage.
          Use the sidebar to explore individual cell metrics including voltage, current, 
          temperature, and capacity over time.
        </p>
      </div>
    </div>
  )
}

function Loader() {
  return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px', height:'100vh' }}>
      <div style={{ width:'36px', height:'36px', border:'3px solid var(--border)', borderTop:'3px solid var(--cyan)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <p style={{ color:'var(--muted)', fontFamily:'var(--mono)', fontSize:'12px' }}>Loading battery data...</p>
    </div>
  )
}
