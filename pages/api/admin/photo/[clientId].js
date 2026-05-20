import { getGitHubFile, putGitHubFile, getGitHubFileSha } from '../../../../lib/github'
import { getSession } from '../../../../lib/session'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!getSession(req)?.isAdmin) return res.status(401).json({ error: '관리자 권한이 필요합니다.' })

  const { clientId } = req.query
  const { filename, base64 } = req.body
  if (!filename || !base64) return res.status(400).json({ error: 'filename과 base64가 필요합니다.' })

  try {
    const photoPath = `public/photos/${clientId}/${filename}`
    const existingSha = await getGitHubFileSha(photoPath)
    await putGitHubFile(photoPath, base64, `사진 업로드: ${filename}`, existingSha, true)

    const { content, sha } = await getGitHubFile('data/clients.json')
    const data = JSON.parse(content)

    const idx = data.clients.findIndex(c => c.id === clientId)
    if (idx !== -1 && !data.clients[idx].photos.includes(filename)) {
      data.clients[idx].photos.push(filename)
      await putGitHubFile('data/clients.json', JSON.stringify(data, null, 2), `사진 등록: ${filename}`, sha)
    }

    return res.status(200).json({ success: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
