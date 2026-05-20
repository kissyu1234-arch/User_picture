import fs from 'fs'
import path from 'path'
import { setSession } from '../../lib/session'

const ADMIN = { name: '김우희', dob: '2000-01-28' }

function getClients() {
  const filePath = path.join(process.cwd(), 'data', 'clients.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, dob } = req.body
  if (!name || !dob) return res.status(400).json({ success: false })

  // 관리자 확인
  if (name === ADMIN.name && dob === ADMIN.dob) {
    setSession(res, { isAdmin: true })
    return res.status(200).json({ success: true, redirect: '/admin' })
  }

  // 이용인 확인
  const { clients } = getClients()
  const match = clients.find(c => c.name === name && c.dob === dob)

  if (!match) {
    // 브루트포스 방지: 실패 시 1초 지연
    await new Promise(r => setTimeout(r, 1000))
    return res.status(200).json({ success: false })
  }

  setSession(res, { isAdmin: false, clientId: match.id })
  return res.status(200).json({ success: true, redirect: '/gallery' })
}
