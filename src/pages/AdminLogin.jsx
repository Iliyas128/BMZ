import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api/config'
import { getToken, setToken } from '../api/auth'

export default function AdminLogin() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = getToken()
    if (!token) return
    fetch(`${API_BASE_URL}/api/admin/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.ok) navigate('/auelbek/dashboard', { replace: true })
      })
      .catch(() => {})
  }, [navigate])
  const [step, setStep] = useState('request') // request | verify
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [requestId, setRequestId] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState({ type: 'idle', message: '' })

  const canRequest = useMemo(() => {
    return email.trim().length > 3 && fullName.trim().length > 2
  }, [email, fullName])

  const canVerify = useMemo(() => {
    return requestId.trim().length > 10 && code.trim().length >= 4
  }, [requestId, code])

  async function handleRequest(e) {
    e.preventDefault()
    if (!canRequest) return
    setStatus({ type: 'loading', message: 'Отправляем код...' })

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus({ type: 'error', message: data.message || 'Ошибка отправки кода' })
        return
      }

      setRequestId(data.requestId)
      setStep('verify')
      setStatus({ type: 'ok', message: 'Код отправлен администратору. Введите OTP.' })
    } catch {
      setStatus({ type: 'error', message: 'Сервер недоступен' })
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    if (!canVerify) return
    setStatus({ type: 'loading', message: 'Проверяем код...' })

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, code }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus({ type: 'error', message: data.message || 'Неверный код' })
        return
      }

      setToken(data.token)
      setStatus({ type: 'ok', message: 'Вход выполнен' })
      navigate('/auelbek/dashboard', { replace: true })
    } catch {
      setStatus({ type: 'error', message: 'Сервер недоступен' })
    }
  }

  return (
    <div className="bmz-container" style={{ padding: '24px 16px' }}>
      <div className="bmzBlock" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="bmzBlockInner">
          <div className="bmzSectionLabel">Админ-доступ</div>
          <div className="bmzSectionTitle">Вход (OTP)</div>

          {step === 'request' ? (
            <form onSubmit={handleRequest} style={{ display: 'grid', gap: 12 }}>
              <div>
                <div className="bmzFieldLabel">Email</div>
                <div className="bmzField">
                  <input
                    className="bmzInput"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@company.kz"
                  />
                </div>
              </div>

              <div>
                <div className="bmzFieldLabel">Имя и фамилия</div>
                <div className="bmzField">
                  <input
                    className="bmzInput"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Имя Фамилия"
                  />
                </div>
              </div>

              <button className="bmzLeadBtn" type="submit" disabled={!canRequest}>
                Продолжить
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} style={{ display: 'grid', gap: 12 }}>
              <div className="bmzGrayText">
                Код отправлен на email администратора. Получите OTP и введите ниже.
              </div>

              <div>
                <div className="bmzFieldLabel">OTP-код</div>
                <div className="bmzField">
                  <input
                    className="bmzInput"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <button className="bmzLeadBtn" type="submit" disabled={!canVerify}>
                Войти
              </button>

              <button
                type="button"
                className="bmzBackBtn"
                onClick={() => {
                  setStep('request')
                  setCode('')
                  setStatus({ type: 'idle', message: '' })
                }}
              >
                ← Назад
              </button>
            </form>
          )}

          {status.type !== 'idle' ? (
            <div
              className="bmzNoteCard"
              style={{
                marginTop: 14,
                background:
                  status.type === 'error'
                    ? '#FFF3E0'
                    : status.type === 'ok'
                      ? '#E8F5E9'
                      : '#F3F7FC',
              }}
              role="status"
            >
              {status.message}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

