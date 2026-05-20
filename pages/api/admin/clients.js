import { getGitHubFile, putGitHubFile } from '../../../lib/github'
import { getSession } from '../../../lib/session'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!getSession(req)?.isAdmin) return res.status(401).json({ error: '관리자 권한이 필요합니다.' })

  const { name, dob } = req.body
  if (!name || !dob) return res.status(400).json({ error: '이름과 생년월일을 입력하세요.' })

  try {
    const { content, sha } = await getGitHubFile('data/clients.json')
    const data = JSON.parse(content)

    const newClient = { id: `client-${Date.now()}`, name, dob, photos: [] }
    data.clients.push(newClient)

    await putGitHubFile('data/clients.json', JSON.stringify(data, null, 2), `이용인 추가: ${name}`, sha)
    await putGitHubFile(`public/photos/${newClient.id}/.gitkeep`, '', `사진 폴더 생성: ${name}`)

    return res.status(200).json({ success: true, client: newClient })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
