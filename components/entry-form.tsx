'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { SHIFTS, CATEGORIES, type ShiftId, type Category } from '@/lib/types'

interface ParsedData {
  rollNumber: string
  candidateName: string
  rawMarks: number
}

export function EntryForm() {
  const router = useRouter()

  const [htmlInput, setHtmlInput] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [shiftId, setShiftId] = useState<ShiftId | ''>('')
  const [category, setCategory] = useState<Category | ''>('')
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ✅ PARSE
  const handleParse = async () => {
    if (!htmlInput.trim()) {
      setErrors({ html: 'Please paste response sheet HTML' })
      return
    }

    setIsParsing(true)
    setErrors({})
    setParsedData(null)

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        body: JSON.stringify({ html: htmlInput }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Parsing failed')
      }

      setParsedData({
        rollNumber: data.rollNo,
        candidateName: data.name,
        rawMarks: data.marks,
      })

      setCandidateName(data.name)
      toast.success('Parsed successfully!')
    } catch (err: any) {
      console.error("PARSE ERROR:", err)
      toast.error(err.message)
      setErrors({ html: err.message })
    } finally {
      setIsParsing(false)
    }
  }

  // ✅ VALIDATION
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!parsedData) newErrors.html = 'Parse response sheet first'
    if (!candidateName.trim()) newErrors.candidateName = 'Name required'
    if (!shiftId) newErrors.shiftId = 'Select shift'
    if (!category) newErrors.category = 'Select category'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ✅ SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !parsedData) return

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('entries')
        .insert({
          roll_number: parsedData.rollNumber.trim(),
          candidate_name: candidateName.trim(),
          raw_marks: parsedData.rawMarks,
          proportionate_marks: parsedData.rawMarks,
          cancelled_questions: 0,
          shift_id: shiftId,
          category: category,
        })
        .select()

      console.log("INSERT DATA:", data)
      console.log("INSERT ERROR:", error)

      if (error) {
        // 🔥 Handle duplicate
        if (error.code === '23505') {
          toast.error('This roll number already submitted')
          return
        }

        throw error
      }

      toast.success('Entry submitted successfully!')
      router.push(`/my-rank/${parsedData.rollNumber}`)
    } catch (err: any) {
      console.error("SUBMIT ERROR:", err)
      toast.error(err.message || 'Submission failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Your Marks</CardTitle>
        <CardDescription>
          Paste response sheet (Ctrl + A → Ctrl + C)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>

            {/* STEP 1 */}
            <Field>
              <FieldLabel>Paste Response Sheet *</FieldLabel>
              <textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                className="w-full min-h-[150px] border p-2 rounded"
              />
              {errors.html && <FieldError>{errors.html}</FieldError>}
            </Field>

            <Button type="button" onClick={handleParse} disabled={isParsing}>
              {isParsing ? <Loader2 className="animate-spin" /> : 'Parse'}
            </Button>

            {/* RESULT */}
            {parsedData && (
              <Alert>
                <CheckCircle2 className="size-4 text-green-600" />
                <AlertTitle>Parsed Successfully</AlertTitle>
                <AlertDescription>
                  <div><b>Name:</b> {parsedData.candidateName}</div>
                  <div><b>Roll:</b> {parsedData.rollNumber}</div>
                  <div><b>Marks:</b> {parsedData.rawMarks}</div>
                </AlertDescription>
              </Alert>
            )}

            {/* STEP 2 */}
            <Field>
              <FieldLabel>Name *</FieldLabel>
              <Input
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
              {errors.candidateName && <FieldError>{errors.candidateName}</FieldError>}
            </Field>

            {/* STEP 3 */}
            <div className="grid grid-cols-2 gap-4">

              <Field>
                <FieldLabel>Shift *</FieldLabel>
                <Select
                  value={shiftId}
                  onValueChange={(v: ShiftId) => setShiftId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.shiftId && <FieldError>{errors.shiftId}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>Category *</FieldLabel>
                <Select
                  value={category}
                  onValueChange={(v: Category) => setCategory(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <FieldError>{errors.category}</FieldError>}
              </Field>

            </div>

            <Button
              type="submit"
              disabled={isLoading || !parsedData}
              className="w-full"
            >
              {isLoading && <Loader2 className="animate-spin" />}
              Submit Entry
            </Button>

          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}