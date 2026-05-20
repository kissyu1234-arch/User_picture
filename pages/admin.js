import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminPage() {
  const router = useRouter()
  const [clients, setClients] = useState([])
  const [modal, setModal] = useState(null) // null | 'add' | client객체
  const [expandedId, setExpandedId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('adminClients')
    if (!stored) { router.replace('/'); return }
    setClients(JSON.parse(stored))
  }, [router])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  async function handleSaveClient(name, dob) {
    setBusy(true)
    try {
      if (modal === 'add') {
        const res = await fetch('/api/admin/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, dob }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setClients(prev => [...prev, { ...data.client, photoCount: 0 }])
      } else {
        const res = await fetch(`/api/admin/client/${modal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, dob }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setClients(prev => prev.map(c => c.id === modal.id ? { ...c, name, dob } : c))
      }
      setModal(null)
      showToast('저장되었습니다. 1~2분 후 사이트에 반영됩니다.')
    } catch (e) {
      showToast(`오류: ${e.message}`)
    }
    setBusy(false)
  }

  async function handleDeleteClient(client) {
    if (!confirm(`${client.name} 님을 삭제하시겠습니까?\n사진도 함께 삭제됩니다.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/client/${client.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setClients(prev => prev.filter(c => c.id !== client.id))
      if (expandedId === client.id) setExpandedId(null)
      showToast('삭제되었습니다.')
    } catch (e) {
      showToast(`오류: ${e.message}`)
    }
    setBusy(false)
  }

  async function handleUploadPhotos(clientId, files) {
    for (const file of files) {
      setBusy(true)
      try {
        const base64 = await fileToBase64(file)
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const res = await fetch(`/api/admin/photo/${clientId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, base64 }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setClients(prev => prev.map(c =>
          c.id === clientId
            ? { ...c, photos: [...(c.photos || []), filename], photoCount: (c.photoCount || 0) + 1 }
            : c
        ))
      } catch (e) {
        showToast(`업로드 실패: ${e.message}`)
      }
      setBusy(false)
    }
    showToast('업로드 완료. 1~2분 후 사이트에 반영됩니다.')
  }

  async function handleDeletePhoto(clientId, filename) {
    if (!confirm('이 사진을 삭제하시겠습니까?')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/photo/${clientId}/${encodeURIComponent(filename)}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setClients(prev => prev.map(c =>
        c.id === clientId
          ? { ...c, photos: (c.photos || []).filter(p => p !== filename), photoCount: Math.max(0, (c.photoCount || 1) - 1) }
          : c
      ))
      showToast('사진이 삭제되었습니다.')
    } catch (e) {
      showToast(`오류: ${e.message}`)
    }
    setBusy(false)
  }

  const totalPhotos = clients.reduce((s, c) => s + ((c.photos || []).length || c.photoCount || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">관리자 대시보드</h1>
          <p className="text-sm text-gray-500">이용인 {clients.length}명 · 사진 총 {totalPhotos}장</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModal('add')}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            + 이용인 추가
          </button>
          <button
            onClick={() => { sessionStorage.clear(); router.push('/') }}
            className="text-sm text-gray-500 border border-gray-300 rounded-lg px-3 py-2"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* Client Cards */}
      <div className="p-6 max-w-4xl mx-auto space-y-3">
        {clients.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">👤</div>
            <p>이용인을 추가해 주세요.</p>
          </div>
        ) : clients.map(client => (
          <div key={client.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* 이용인 정보 행 */}
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{client.name}</p>
                <p className="text-sm text-gray-400">
                  {client.dob} · 사진 {(client.photos || []).length || client.photoCount || 0}장
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                <button
                  onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
                  className="text-sm text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50"
                >
                  사진 {expandedId === client.id ? '▲' : '▼'}
                </button>
                <button
                  onClick={() => setModal(client)}
                  className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDeleteClient(client)}
                  className="text-sm text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            </div>

            {/* 사진 관리 패널 */}
            {expandedId === client.id && (
              <div className="border-t border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">사진 관리</p>
                  <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg">
                    + 사진 업로드
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => {
                        const files = Array.from(e.target.files)
                        handleUploadPhotos(client.id, files)
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>
                {(client.photos || []).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">업로드된 사진이 없습니다.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {(client.photos || []).map(photo => (
                      <div key={photo} className="relative group aspect-square">
                        <img
                          src={`/photos/${client.id}/${photo}`}
                          alt={photo}
                          className="w-full h-full object-cover rounded-lg bg-gray-100"
                          onError={e => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                        <div
                          style={{ display: 'none' }}
                          className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 text-center p-1"
                        >
                          반영 대기중
                        </div>
                        <button
                          onClick={() => handleDeletePhoto(client.id, photo)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 이용인 추가/수정 모달 */}
      {modal && (
        <ClientModal
          client={modal === 'add' ? null : modal}
          busy={busy}
          onSave={handleSaveClient}
          onClose={() => setModal(null)}
        />
      )}

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-5 py-3 rounded-xl shadow-lg z-50 whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* 로딩 오버레이 */}
      {busy && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-white rounded-xl px-6 py-4 text-sm text-gray-600 shadow-lg pointer-events-auto">
            처리 중...
          </div>
        </div>
      )}
    </div>
  )
}

function ClientModal({ client, busy, onSave, onClose }) {
  const [name, setName] = useState(client?.name || '')
  const [dob, setDob] = useState(client?.dob || '')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-5">
          {client ? '이용인 수정' : '이용인 추가'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="이름 입력"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm"
          >
            취소
          </button>
          <button
            onClick={() => onSave(name, dob)}
            disabled={busy || !name || !dob}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2.5 rounded-lg text-sm font-medium"
          >
            {busy ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
