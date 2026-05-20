import clientsData from '../../data/clients.json'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { name, dob } = req.body

  if (!name || !dob) {
    return res.status(400).json({ success: false })
  }

  const match = clientsData.clients.find(
    c => c.name === name && c.dob === dob
  )

  if (!match) {
    return res.status(200).json({ success: false })
  }

  return res.status(200).json({
    success: true,
    client: {
      id: match.id,
      name: match.name,
      photos: match.photos,
    },
  })
}
