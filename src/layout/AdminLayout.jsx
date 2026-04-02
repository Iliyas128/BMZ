import { useNavigate } from 'react-router-dom'
import { clearToken } from '../api/auth'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()

  function handleLogout() {
    clearToken()
    navigate('/auelbek', { replace: true })
  }

  return (
    <div className="bmzAdminRoot">
      <header className="bmzAdminTop">
        <div className="bmz-container bmzAdminTopInner">
          <div className="bmzAdminBrand">BMZ · админка</div>
          <div className="bmzAdminTopActions">
            <button type="button" className="bmzAdminLinkBtn" onClick={() => navigate('/')}>
              На сайт
            </button>
            <button type="button" className="bmzAdminLogout" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>
      </header>
      <div className="bmzAdminBody">{children}</div>
    </div>
  )
}
