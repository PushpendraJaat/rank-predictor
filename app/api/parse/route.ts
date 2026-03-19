import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { html } = await req.json()

  const text = html.replace(/\s+/g, ' ').trim()

  // ✅ Extract Name
const nameMatch = text.match(
  /Name of the Candidate\s+([A-Z\s]+?)(?:\s+Examination Name|\s+Exam Date|\s+Roll Number)/i
)

const name = nameMatch ? nameMatch[1].trim() : ''

  // ✅ Extract Roll Number
  const rollMatch = text.match(/Roll Number\s+(\w+)/i)
  const rollNo = rollMatch ? rollMatch[1].trim() : ''

  // ✅ Extract Date
  const dateMatch = text.match(/\d{2}-\d{2}-\d{4}/)
  const examDate = dateMatch ? dateMatch[0] : ''


  // 🔥 DATE VALIDATION
  if (!['15-03-2026', '16-03-2026'].includes(examDate)) {
    return NextResponse.json(
      { error: 'Only 15 & 16 March exams allowed (COPA only)' },
      { status: 400 }
    )
  }

  // ✅ Extract marks (compare Option IDs)
  let correct = 0

  const givenMatches = [...text.matchAll(/Option ID\s*:\s*-?(\d+)/g)]
  const correctMatches = [...text.matchAll(/Correct Answer.*?Option ID\s*:-?\s*(\d+)/g)]

  for (let i = 0; i < Math.min(givenMatches.length, correctMatches.length); i++) {
    if (givenMatches[i][1] === correctMatches[i][1]) {
      correct++
    }
  }

  return NextResponse.json({
    name,
    rollNo,
    marks: correct,
    examDate,
  })
}