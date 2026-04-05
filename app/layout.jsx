import './globals.css'

const BASE_URL = 'https://multidiff.app'

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:  'MultiDiff — Compare Documents Side by Side | Free Online Diff Tool',
    template: '%s | MultiDiff',
  },
  description:
    'Free online tool to compare up to 5 documents simultaneously. Supports PDF, Word, Excel, CSV, JSON and code files. 100% private — files never leave your browser.',
  keywords: [
    'compare documents online', 'document comparison tool', 'PDF comparison tool',
    'diff Word documents', 'compare Excel files', 'document diff tool free',
    'compare PDF files online free', 'DOCX comparison', 'side by side document comparison',
    'file diff tool', 'compare contracts online', 'legal document comparison',
    'compare two PDFs', 'text diff online', 'online diff checker',
  ],
  authors:  [{ name: 'MultiDiff' }],
  creator:  'MultiDiff',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type:        'website',
    url:          BASE_URL,
    title:       'MultiDiff — Compare Up to 5 Documents Side by Side',
    description: 'Free, private, browser-based document comparison. PDF, Word, Excel, JSON and code. No signup required.',
    siteName:    'MultiDiff',
    images: [
      {
        url:    '/og-image.png',
        width:   1200,
        height:  630,
        alt:    'MultiDiff — Compare Documents Side by Side',
      },
    ],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'MultiDiff — Free Multi-Document Comparison Tool',
    description: 'Compare up to 5 documents simultaneously. PDF, Word, Excel, JSON. 100% client-side.',
    images:      ['/og-image.png'],
  },
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },
}

// JSON-LD structured data — WebApplication + FAQPage
// Google uses this to show rich results, FAQ dropdowns, and SiteLinks
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type':            'WebApplication',
      '@id':              `${BASE_URL}/#webapp`,
      name:               'MultiDiff',
      url:                BASE_URL,
      description:        'Free online document comparison tool. Compare up to 5 PDFs, Word, Excel, CSV, JSON or code files side by side. 100% private — files never leave your browser.',
      applicationCategory:'UtilitiesApplication',
      operatingSystem:    'Any',
      browserRequirements:'Requires JavaScript',
      offers: {
        '@type':    'Offer',
        price:      '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Compare up to 5 documents simultaneously',
        'Supports PDF, Word, Excel, CSV, JSON and code files',
        'OCR for scanned PDFs',
        'Side by side comparison with sync scroll',
        '100% client-side — files never uploaded to server',
        'No account or signup required',
        'Copy diff blocks with one click',
        'Export diff summary as text',
      ],
    },
    {
      '@type': 'FAQPage',
      '@id':   `${BASE_URL}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name:    'Is MultiDiff free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:    'Yes, MultiDiff is completely free with no signup required. All document processing happens in your browser.',
          },
        },
        {
          '@type': 'Question',
          name:    'Are my documents safe and private?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:    'Yes. MultiDiff is 100% client-side. Your files are never uploaded to any server — all comparison happens locally in your browser.',
          },
        },
        {
          '@type': 'Question',
          name:    'What file types can I compare?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:    'MultiDiff supports PDF (including scanned PDFs via OCR), Word (.docx, .doc), Excel (.xlsx, .xls), CSV, JSON, and code files (JS, Python, Go, Java, and more).',
          },
        },
        {
          '@type': 'Question',
          name:    'How many documents can I compare at once?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:    'You can compare up to 5 documents simultaneously. The first document becomes the reference, and all others are compared against it.',
          },
        },
        {
          '@type': 'Question',
          name:    'Can I compare scanned PDFs?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:    'Yes. MultiDiff automatically detects scanned PDFs and uses OCR (Optical Character Recognition) to extract text before comparing.',
          },
        },
      ],
    },
    {
      '@type':     'Organization',
      '@id':       `${BASE_URL}/#org`,
      name:        'MultiDiff',
      url:          BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url:     `${BASE_URL}/logo.png`,
      },
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Umami Analytics — set NEXT_PUBLIC_UMAMI_ID in .env.local */}
        {process.env.NEXT_PUBLIC_UMAMI_ID && (
          <script
            defer
            src={process.env.NEXT_PUBLIC_UMAMI_URL || 'https://cloud.umami.is/script.js'}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_ID}
          />
        )}
      </head>
      <body className="h-full bg-black text-zinc-100 antialiased">{children}</body>
    </html>
  )
}
