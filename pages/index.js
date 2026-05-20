import { useState } from 'react'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), dob }),
    })

    const data = await res.json()
    setLoading(false)

    if (!data.success) {
      setError('이름 또는 생년월일이 올바르지 않습니다.')
      return
    }

    if (data.isAdmin) {
      sessionStorage.setItem('adminClients', JSON.stringify(data.clients))
      router.push('/admin')
    } else {
      sessionStorage.setItem('client', JSON.stringify(data.client))
      router.push('/gallery')
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📷</div>
          <h1 className="text-2xl font-bold text-gray-800">이용인 사진 보기</h1>
          <p className="text-gray-500 text-sm mt-2">이용인의 이름과 생년월일을 입력해 주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="이름 입력"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              생년월일
            </label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? '확인 중...' : '사진 보러 가기'}
          </button>
        </form>
      </div>
    </div>
  )
}
