import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import AdminLayout from './layout/AdminLayout'
import RequireAuth from './components/RequireAuth'
import HomePage from './pages/HomePage'
import ProductPages from './pages/ProductPages'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="bmzApp">
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductPages />} />
            <Route path="/products/:pageId" element={<ProductPages />} />
          </Route>

          <Route path="/auelbek" element={<AdminLogin />} />
          <Route
            path="/auelbek/dashboard"
            element={
              <RequireAuth>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
