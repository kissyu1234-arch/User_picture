/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      // static 파일보다 먼저 처리 — /photos/ 직접 접근 차단
      beforeFiles: [
        {
          source: '/photos/:clientId/:filename',
          destination: '/api/photo/:clientId/:filename',
        },
      ],
    }
  },
}

module.exports = nextConfig
