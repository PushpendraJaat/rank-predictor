export interface ParsedResponse {
  rollNumber: string
  candidateName: string
  proportionateMarks: number
  rawMarks: number
  cancelledQuestions: number
  trade: string | null
}

/**
 * Parse MP ESB response sheet HTML to extract candidate data
 * Uses CORS proxy for client-side fetching
 */
export async function parseESBResponseSheet(url: string): Promise<ParsedResponse> {
  // Use allorigins.win as CORS proxy
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`

  const response = await fetch(proxyUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch response sheet. Please check the URL and try again.')
  }

  const html = await response.text()

  // Parse the HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Extract data from the response sheet
  // Note: These selectors may need adjustment based on actual MP ESB HTML structure
  const rollNumber = extractField(doc, ['Roll No', 'Roll Number', 'रोल नंबर', 'Roll No.'])
  const candidateName = extractField(doc, ['Candidate Name', 'Name', 'नाम', "Candidate's Name"])
  const proportionateMarks = extractNumericField(doc, ['Proportionate Marks', 'Normalized Score', 'आनुपातिक अंक', 'Proportionate Score'])
  const rawMarks = extractNumericField(doc, ['Marks Obtained', 'Raw Score', 'प्राप्त अंक', 'Total Marks', 'Obtained Marks'])
  const cancelledQuestions = extractNumericField(doc, ['Cancelled Questions', 'निरस्त प्रश्न', 'Cancelled Ques']) || 0
  const trade = extractField(doc, ['Trade', 'Subject', 'Trade Name', 'व्यापार', 'विषय', 'Post', 'Post Name'])

  if (!rollNumber || !candidateName || proportionateMarks === null) {
    throw new Error('Could not parse all required fields from the response sheet. Please check the URL.')
  }

  return {
    rollNumber,
    candidateName,
    proportionateMarks,
    rawMarks: rawMarks || proportionateMarks,
    cancelledQuestions,
    trade,
  }
}

/**
 * Check if the trade is COPA (Computer Operator and Programming Assistant)
 */
export function isCOPATrade(trade: string | null): boolean {
  if (!trade) return false
  
  const normalizedTrade = trade.toLowerCase().trim()
  
  // Check for various COPA identifiers
  return (
    normalizedTrade.includes('copa') ||
    normalizedTrade.includes('computer operator') ||
    normalizedTrade.includes('programming assistant') ||
    normalizedTrade.includes('कंप्यूटर ऑपरेटर') ||
    normalizedTrade.includes('कम्प्यूटर ऑपरेटर') ||
    // Also check for trade codes if they use numeric codes
    normalizedTrade === '442' // Common COPA trade code
  )
}

function extractField(doc: Document, labels: string[]): string | null {
  // Try multiple strategies to find the field

  // Strategy 1: Look in table cells
  const tables = doc.querySelectorAll('table')
  for (const table of tables) {
    const rows = table.querySelectorAll('tr')
    for (const row of rows) {
      const cells = row.querySelectorAll('td, th')
      for (let i = 0; i < cells.length - 1; i++) {
        const cellText = cells[i].textContent?.trim().toLowerCase() || ''
        for (const label of labels) {
          if (cellText.includes(label.toLowerCase())) {
            const value = cells[i + 1]?.textContent?.trim()
            if (value) return value
          }
        }
      }
    }
  }

  // Strategy 2: Look for labeled spans/divs
  for (const label of labels) {
    const elements = doc.querySelectorAll('*')
    for (const el of elements) {
      const text = el.textContent?.trim() || ''
      if (text.toLowerCase().includes(label.toLowerCase() + ':')) {
        const match = text.match(new RegExp(label + '\\s*:\\s*(.+)', 'i'))
        if (match) return match[1].trim()
      }
    }
  }

  // Strategy 3: Look for label followed by value in next sibling
  for (const label of labels) {
    const elements = doc.querySelectorAll('*')
    for (const el of elements) {
      if (el.textContent?.trim().toLowerCase() === label.toLowerCase()) {
        const nextSibling = el.nextElementSibling
        if (nextSibling?.textContent?.trim()) {
          return nextSibling.textContent.trim()
        }
      }
    }
  }

  return null
}

function extractNumericField(doc: Document, labels: string[]): number | null {
  const value = extractField(doc, labels)
  if (!value) return null

  // Extract number from string (handles formats like "85.50" or "85.50/100")
  const match = value.match(/[\d.]+/)
  if (match) {
    return parseFloat(match[0])
  }
  return null
}

/**
 * Validate MP ESB URL format
 */
export function isValidESBUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Check if it's from MP ESB domain (adjust as needed)
    return (
      parsed.hostname.includes('mponline') ||
      parsed.hostname.includes('mpesb') ||
      parsed.hostname.includes('vyapam') ||
      url.includes('response') // fallback for response sheet URLs
    )
  } catch {
    return false
  }
}
