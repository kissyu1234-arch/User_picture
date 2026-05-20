import { getGitHubFile, putGitHubFile, deleteGitHubFile, getGitHubFileSha } from '../../../../lib/github'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'PUT') {
    const { name, dob } = req.body
    if (!name || !dob) return res.status(400).json({ error: '이름과 생년월일을 입력하세요.' })

    try {
      const { content, sha } = await getGitHubFile('data/clients.json')
      const data = JSON.parse(content)

      const idx = data.clients.findIndex(c => c.id === id)
      if (idx === -1) return res.status(404).json({ error: '이용인을 찾을 수 없습니다.' })

      data.clients[idx] = { ...data.clients[idx], name, dob }
      await putGitHubFile('data/clients.json', JSON.stringify(data, null, 2), `이용인 수정: ${name}`, sha)

      return res.status(200).json({ success: true, client: data.clients[idx] })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { content, sha } = await getGitHubFile('data/clients.json')
      const data = JSON.parse(content)

      const client = data.clients.find(c => c.id === id)
      if (!client) return res.status(404).json({ error: '이용인을 찾을 수 없습니다.' })

      // 사진 파일 삭제
      for (const photo of client.photos) {
        const photoSha = await getGitHubFileSha(`public/photos/${id}/${photo}`)
        if (photoSha) await deleteGitHubFile(`public/photos/${id}/${photo}`, `사진 삭제: ${photo}`, photoSha)
      }
      const gitkeepSha = await getGitHubFileSha(`public/photos/${id}/.gitkeep`)
      if (gitkeepSha) await deleteGitHubFile(`public/photos/${id}/.gitkeep`, `폴더 삭제: ${id}`, gitkeepSha)

      data.clients = data.clients.filter(c => c.id !== id)
      await putGitHubFile('data/clients.json', JSON.stringify(data, null, 2), `이용인 삭제: ${client.name}`, sha)

      return res.status(200).json({ success: true })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).end()
}
