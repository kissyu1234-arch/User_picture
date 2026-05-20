import crypto from 'crypto'

const COOKIE = 'ph_sess'
const MAX_AGE = 60 * 60 * 8 // 8시간

function sign(payload) {
  const secret = process.env.SESSION_SECRET || 'dev-secret-please-set-env-var'
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function setSession(res, data) {
  const payload = Buffer.from(JSON.stringify({ ...data, exp: Date.now() + MAX_AGE * 1000 })).toString('base64')
  const sig = sign(payload)
  const token = `${payload}.${sig}`
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; HttpOnly; ${secure}SameSite=Strict; Path=/; Max-Age=${MAX_AGE}`)
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Path=/; Max-Age=0`)
}

export function getSession(req) {
  const token = req.cookies?.[COOKIE]
  if (!token) return null
  try {
    const dot = token.lastIndexOf('.')
    const payload = token.slice(0, dot)
    const sig = token.slice(dot + 1)

    const expected = sign(payload)
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null

    const data = JSON.parse(Buffer.from(payload, 'base64').toString())
    if (Date.now() > data.exp) return null
    return data
  } catch {
    return null
  }
}
