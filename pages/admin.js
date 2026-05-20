import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminPage() {
  const router = useRouter()
  const [clients, setClients] = useState(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('adminClients')
    if (!stored) {
      router.replace('/')
      return
    }
    setClients(JSON.parse(stored))
  }, [router])

  function viewGallery(client) {
    sessionStorage.setItem('client', JSON.stringify({
      id: client.id,
      name: client.name,
      photos: client.photos,
    }))
    sessionStorage.setItem('fromAdmin', '1')
    router.push('/gallery')
  }

  function logout() {
    sessionStorage.removeItem('adminClients')
    router.push('/')
  }

  if (!clients) return null

  const totalPhotos = clients.reduce((sum, c) => sum + c.photoCount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">관리자 대시보드</h1>
          <p className="text-sm text-gray-500">
            이용인 {clients.length}명 · 사진 총 {totalPhotos}장
          </p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5"
        >
          로그아웃
        </button>
      </div>

      {/* Client Cards */}
      <div className="p-6 max-w-4xl mx-auto">
        {clients.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">👤</div>
            <p>등록된 이용인이 없습니다.</p>
            <p className="text-sm mt-2">data/clients.json 파일에 이용인을 추가해 주세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {clients.map(client => (
              <div
                key={client.id}
                className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{client.name}</p>
                    <p className="text-xs text-gray-400">{client.dob}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  사진 <span className="font-medium text-gray-700">{client.photoCount}장</span>
                </div>

                <button
                  onClick={() => viewGallery(client)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  사진 보기
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 이용인 추가 안내 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">이용인 추가 방법</p>
          <p>GitHub에서 <code className="bg-blue-100 px-1 rounded">data/clients.json</code> 파일을 수정하고,
          사진은 <code className="bg-blue-100 px-1 rounded">public/photos/&#123;id&#125;/</code> 폴더에 업로드해 주세요.</p>
        </div>
      </div>
    </div>
  )
}
