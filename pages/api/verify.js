import fs from 'fs'
import path from 'path'

const ADMIN = { name: '김우희', dob: '2000-01-28' }

function getClients() {
  const filePath = path.join(process.cwd(), 'data', 'clients.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { name, dob } = req.body

  if (!name || !dob) {
    return res.status(400).json({ success: false })
  }

  // 관리자 확인
  if (name === ADMIN.name && dob === ADMIN.dob) {
    const { clients } = getClients()
    return res.status(200).json({
      success: true,
      isAdmin: true,
      clients: clients.map(c => ({
        id: c.id,
        name: c.name,
        dob: c.dob,
        photoCount: c.photos.length,
        photos: c.photos,
      })),
    })
  }

  // 이용인 확인
  const { clients } = getClients()
  const match = clients.find(c => c.name === name && c.dob === dob)

  if (!match) {
    return res.status(200).json({ success: false })
  }

  return res.status(200).json({
    success: true,
    isAdmin: false,
    client: {
      id: match.id,
      name: match.name,
      photos: match.photos,
    },
  })
}
