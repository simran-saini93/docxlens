/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Prevent canvas from being bundled (pdfjs optional dependency)
    config.resolve.alias.canvas   = false
    config.resolve.alias.encoding = false

    if (isServer) {
      // These are browser-only — exclude from server bundle
      config.externals = [
        ...(config.externals || []),
        'mammoth',
        'exceljs',
      ]
    }

    return config
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'DENY'    },
          { key: 'X-XSS-Protection',       value: '1; mode=block' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
