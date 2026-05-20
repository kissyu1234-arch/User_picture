import fs from 'fs'
import path from 'path'
import { getSession } from '../../lib/session'

function getClients() {
  const filePath = path.join(process.cwd(), 'data', 'clients.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const session = getSession(req)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const { clients } = getClients()

  if (session.isAdmin) {
    return res.status(200).json({
      isAdmin: true,
      clients: clients.map(c => ({ ...c, photoCount: c.photos.length })),
    })
  }

  const client = clients.find(c => c.id === session.clientId)
  if (!client) return res.status(404).json({ error: '이용인을 찾을 수 없습니다.' })

  return res.status(200).json({ isAdmin: false, client })
}
