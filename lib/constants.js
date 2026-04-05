export const MAX_DOCS           = 5
export const MAX_FILE_SIZE_MB   = 20
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export const ACCEPTED_EXTENSIONS = [
  '.pdf', '.docx', '.doc',
  '.xlsx', '.xls', '.csv',
  '.txt', '.md', '.json',
  '.js', '.jsx', '.ts', '.tsx',
  '.py', '.rb', '.go', '.java',
  '.c', '.cpp', '.cs', '.php', '.sh',
]

export const ACCEPT_STRING = ACCEPTED_EXTENSIONS.join(',')

export const FILE_TYPE_MAP = {
  json:  { label: 'JSON',  color: 'text-yellow-400 bg-yellow-500/10' },
  excel: { label: 'XLS',   color: 'text-green-400 bg-green-500/10'  },
  pdf:   { label: 'PDF',   color: 'text-red-400 bg-red-500/10'      },
  docx:  { label: 'DOC',   color: 'text-blue-400 bg-blue-500/10'    },
  code:  { label: 'CODE',  color: 'text-purple-400 bg-purple-500/10'},
  text:  { label: 'TXT',   color: 'text-zinc-400 bg-zinc-500/10'    },
}
