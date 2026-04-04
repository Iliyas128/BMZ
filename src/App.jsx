import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import MainLayout from './layout/MainLayout'
import AdminLayout from './layout/AdminLayout'
import RequireAuth from './components/RequireAuth'
import BmzSpinner from './components/BmzSpinner'
import HomePage from './pages/HomePage'
import AdminLogin from './pages/AdminLogin'
import './App.css'

const CatalogHome = lazy(() => import('./pages/catalog/CatalogHome'))
const CatalogCategory = lazy(() => import('./pages/catalog/CatalogCategory'))
const CatalogSubcategory = lazy(() => import('./pages/catalog/CatalogSubcategory'))
const CatalogProductRedirect = lazy(() => import('./pages/catalog/CatalogProductRedirect'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="bmzApp">
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/auelbek/home-edit"
                element={
                  <RequireAuth>
                    <HomePage homeEditMode />
                  </RequireAuth>
                }
              />
              <Route
                element={
                  <Suspense fallback={<BmzSpinner label="Загрузка страницы…" />}>
                    <Outlet />
                  </Suspense>
                }
              >
                <Route path="/products" element={<CatalogHome />} />
                <Route path="/products/c/:catSlug" element={<CatalogCategory />} />
                <Route path="/products/c/:catSlug/s/:subSlug" element={<CatalogSubcategory />} />
                <Route path="/products/c/:catSlug/s/:subSlug/p/:productSlug" element={<CatalogProductRedirect />} />
              </Route>
          </Route>

          <Route path="/auelbek" element={<AdminLogin />} />
          <Route
            path="/auelbek/dashboard"
            element={
              <RequireAuth>
                <AdminLayout>
                  <Suspense fallback={<BmzSpinner label="Загрузка админки…" />}>
                    <AdminDashboard />
                  </Suspense>
                </AdminLayout>
              </RequireAuth>
            }
          />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}
