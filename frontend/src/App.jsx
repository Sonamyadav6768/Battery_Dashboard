import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import CellDetail from './pages/CellDetail'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto', animation: 'fadeIn 0.4s ease' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cell/:cellId" element={<CellDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
