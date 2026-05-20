import fs from 'fs'
import path from 'path'
import { getSession } from '../../../lib/session'

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
}

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const session = getSession(req)
  if (!session) return res.status(401).end()

  const parts = req.query.path
  if (!parts || parts.length !== 2) return res.status(400).end()

  const [clientId, filename] = parts

  // 경로 조작 방지
  if (!/^[a-zA-Z0-9_-]+$/.test(clientId) || !/^[a-zA-Z0-9._\- ]+$/.test(filename)) {
    return res.status(400).end()
  }

  // 접근 권한: 본인 또는 관리자만
  if (!session.isAdmin && session.clientId !== clientId) {
    return res.status(403).end()
  }

  const filePath = path.join(process.cwd(), 'public', 'photos', clientId, filename)

  // public 폴더 밖으로 나가는 경로 차단
  const allowed = path.join(process.cwd(), 'public', 'photos')
  if (!filePath.startsWith(allowed)) return res.status(400).end()

  if (!fs.existsSync(filePath)) return res.status(404).end()

  const ext = path.extname(filename).toLowerCase()
  const contentType = CONTENT_TYPES[ext] || 'application/octet-stream'

  res.setHeader('Content-Type', contentType)
  res.setHeader('Cache-Control', 'private, max-age=3600')
  res.send(fs.readFileSync(filePath))
}
