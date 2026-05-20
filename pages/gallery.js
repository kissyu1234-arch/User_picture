import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function GalleryPage() {
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch('/api/session')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data) { router.replace('/'); return }
        if (data.isAdmin) { router.replace('/admin'); return }
        setClient(data.client)
      })
  }, [router])

  async function logout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/')
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{client.name} 님의 사진</h1>
          <p className="text-sm text-gray-500">총 {client.photos.length}장</p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5"
        >
          나가기
        </button>
      </div>

      {/* Photo Grid */}
      <div className="p-4 max-w-4xl mx-auto">
        {client.photos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">📂</div>
            <p>등록된 사진이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {client.photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setSelected(photo)}
                className="aspect-square overflow-hidden rounded-xl bg-gray-200 hover:opacity-90 transition-opacity"
              >
                <img
                  src={`/photos/${client.id}/${photo}`}
                  alt={`${client.name} 사진 ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-10 right-0 text-white text-2xl font-light"
            >
              ✕
            </button>
            <img
              src={`/photos/${client.id}/${selected}`}
              alt="확대 사진"
              className="w-full rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
