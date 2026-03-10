import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import ChartCard from '../components/ChartCard'

const API = 'http://localhost:8000'

const CHARTS = [
  { key: 'voltage',     label: 'Voltage vs Time',     color: '#3b82f6', unit: 'V',   dataKey: 'voltage'  },
  { key: 'current',     label: 'Current vs Time',     color: '#f97316', unit: 'mA',  dataKey: 'current'  },
  { key: 'temperature', label: 'Temperature vs Time', color: '#10b981', unit: '°C',  dataKey: 'temperature' },
  { key: 'capacity',    label: 'Capacity vs Time',    color: '#a78bfa', unit: 'mAh', dataKey: 'capacity' },
]

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function computeStats(arr, key) {
  if (!arr || arr.length === 0) return { min: '-', max: '-', avg: '-' }
  const vals = arr.map(r => r[key]).filter(v => v !== null && v !== undefined)
  return {
    min: Math.min(...vals).toFixed(2),
    max: Math.max(...vals).toFixed(2),
    avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
  }
}

export default function CellDetail() {
  const { cellId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState({})
  const [soh, setSoh] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setData({})
    Promise.all([
      axios.get(`${API}/soh/${cellId}`).then(r => setSoh(r.data.soh)),
      ...CHARTS.map(c =>
        axios.get(`${API}/${c.key}/${cellId}`).then(r => ({ [c.key]: r.data }))
      )
    ]).then(results => {
      const merged = Object.assign({}, ...results.slice(1))
      setData(merged)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [cellId])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:'16px' }}>
      <div style={{ width:'36px', height:'36px', border:'3px solid var(--border)', borderTop:`3px solid #3b82f6`, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <p style={{ color:'var(--muted)', fontFamily:'var(--mono)', fontSize:'12px' }}>Loading Cell {cellId}...</p>
    </div>
  )

  const sampleCount = data.voltage?.length ?? 0

  return (
    <div style={{ padding: '40px', maxWidth: '1300px', animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'36px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <button onClick={() => navigate('/')} style={{
            background:'none', border:'none', color:'var(--muted)',
            cursor:'pointer', fontFamily:'var(--mono)', fontSize:'12px',
            padding:0, marginBottom:'10px', display:'flex', alignItems:'center', gap:'6px'
          }}>
            ← Back to Overview
          </button>
          <div style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'#3b82f6', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'8px' }}>
            Cell Detail
          </div>
          <h1 style={{ fontSize:'34px', fontWeight:800 }}>
            Cell ID <span style={{ color:'#3b82f6' }}>{cellId}</span>
          </h1>
          <p style={{ color:'var(--muted)', marginTop:'8px', fontSize:'14px' }}>
            {sampleCount.toLocaleString()} sampled data points · Real battery dataset
          </p>
        </div>

        {/* SoH Badge */}
        {soh !== null && (
          <div style={{
            background: 'var(--surface)', border: '1px solid #3b82f633',
            borderRadius: '14px', padding: '20px 28px', textAlign: 'center'
          }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--muted)', letterSpacing:'0.1em', marginBottom:'6px' }}>STATE OF HEALTH</div>
            <div style={{ fontSize:'40px', fontWeight:800, color:'#3b82f6', lineHeight:1 }}>{soh}%</div>
            <div style={{
              marginTop:'8px', fontSize:'11px', fontFamily:'var(--mono)',
              color: soh > 90 ? '#10b981' : soh > 80 ? '#f97316' : '#ef4444'
            }}>
              {soh > 90 ? '● EXCELLENT' : soh > 80 ? '● GOOD' : '● DEGRADED'}
            </div>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'32px' }}>
        {CHARTS.map(({ key, label, color, unit }) => {
          const s = computeStats(data[key], key)
          return (
            <div key={key} style={{
              background:'var(--surface)', border:`1px solid ${color}22`,
              borderRadius:'12px', padding:'16px 18px'
            }}>
              <div style={{ fontSize:'10px', color:'var(--muted)', fontFamily:'var(--mono)', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label.split(' ')[0]}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'4px' }}>
                {[['MIN', s.min], ['MAX', s.max], ['AVG', s.avg]].map(([lbl, val]) => (
                  <div key={lbl} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'9px', color:'var(--muted)', fontFamily:'var(--mono)' }}>{lbl}</div>
                    <div style={{ fontSize:'13px', fontWeight:700, color }}>{val}</div>
                    <div style={{ fontSize:'9px', color:'var(--muted)' }}>{unit}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts 2x2 Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(500px, 1fr))', gap:'24px' }}>
        {CHARTS.map(({ key, label, color, unit, dataKey }) => (
          <ChartCard key={key} title={label} accent={color}>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={data[key] ?? []} margin={{ top:5, right:10, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="time"
                  tick={{ fill:'var(--muted)', fontSize:10, fontFamily:'var(--mono)' }}
                  tickFormatter={formatTime}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill:'var(--muted)', fontSize:10, fontFamily:'var(--mono)' }}
                  width={52}
                  tickFormatter={v => `${v}`}
                />
                <Tooltip
                  labelFormatter={l => `Time: ${formatTime(l)}`}
                  formatter={v => [`${Number(v).toFixed(3)} ${unit}`, label.split(' ')[0]]}
                  contentStyle={{
                    background:'var(--surface2)', border:`1px solid ${color}33`,
                    borderRadius:'8px', color:'var(--text)', fontSize:'12px',
                    fontFamily:'var(--mono)'
                  }}
                />
                <Line
                  type="monotone" dataKey={dataKey}
                  stroke={color} strokeWidth={1.5}
                  dot={false} activeDot={{ r:4, fill:color, strokeWidth:0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        ))}
      </div>

      {/* Insight box */}
      <div style={{
        marginTop:'28px', background:'var(--surface)', border:'1px solid #10b98133',
        borderRadius:'14px', padding:'22px 28px', display:'flex', gap:'16px', alignItems:'flex-start'
      }}>
        <div style={{ fontSize:'24px' }}>💡</div>
        <div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'#10b981', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            Insight
          </div>
          <p style={{ color:'var(--muted)', fontSize:'14px', lineHeight:1.7 }}>
            While charging, the temperature of Cell {cellId} increases noticeably, 
            which is typical behavior for Li-ion cells during charge cycles. 
            Monitor temperature spikes above 40°C for safe operation.
          </p>
        </div>
      </div>
    </div>
  )
}
