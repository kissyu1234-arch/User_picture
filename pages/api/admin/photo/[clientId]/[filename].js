import { getGitHubFile, putGitHubFile, deleteGitHubFile, getGitHubFileSha } from '../../../../../lib/github'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end()

  const { clientId, filename } = req.query

  try {
    const photoPath = `public/photos/${clientId}/${filename}`
    const photoSha = await getGitHubFileSha(photoPath)
    if (photoSha) await deleteGitHubFile(photoPath, `사진 삭제: ${filename}`, photoSha)

    const { content, sha } = await getGitHubFile('data/clients.json')
    const data = JSON.parse(content)

    const idx = data.clients.findIndex(c => c.id === clientId)
    if (idx !== -1) {
      data.clients[idx].photos = data.clients[idx].photos.filter(p => p !== filename)
      await putGitHubFile('data/clients.json', JSON.stringify(data, null, 2), `사진 삭제 반영: ${filename}`, sha)
    }

    return res.status(200).json({ success: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
