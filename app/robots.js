export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
      },
    ],
    sitemap: 'https://docxlens.com/sitemap.xml',
  }
}