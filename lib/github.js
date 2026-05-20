const OWNER = 'kissyu1234-arch'
const REPO = 'User_picture'
const BRANCH = process.env.GITHUB_BRANCH || 'claude/caregiver-photo-portal-uprZc'

async function ghRequest(path, method, body) {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN 환경변수가 설정되지 않았습니다.')

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || `GitHub API 오류 ${res.status}`)
  return data
}

export async function getGitHubFile(filePath) {
  const data = await ghRequest(`${filePath}?ref=${BRANCH}`, 'GET')
  return {
    content: Buffer.from(data.content, 'base64').toString('utf-8'),
    sha: data.sha,
  }
}

export async function putGitHubFile(filePath, content, message, sha = null, isBinary = false) {
  const encoded = isBinary ? content : Buffer.from(content, 'utf-8').toString('base64')
  const body = { message, content: encoded, branch: BRANCH }
  if (sha) body.sha = sha
  return ghRequest(filePath, 'PUT', body)
}

export async function deleteGitHubFile(filePath, message, sha) {
  return ghRequest(filePath, 'DELETE', { message, sha, branch: BRANCH })
}

export async function getGitHubFileSha(filePath) {
  try {
    const data = await ghRequest(`${filePath}?ref=${BRANCH}`, 'GET')
    return data.sha
  } catch {
    return null
  }
}
