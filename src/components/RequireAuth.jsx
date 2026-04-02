import { Navigate, useLocation } from 'react-router-dom'
import { getToken } from '../api/auth'

export default function RequireAuth({ children }) {
  const location = useLocation()
  const token = getToken()

  if (!token) {
    return <Navigate to="/auelbek" replace state={{ from: location.pathname }} />
  }

  return children
}
