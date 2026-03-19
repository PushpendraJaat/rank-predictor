'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Search } from 'lucide-react'

export default function MyRankPage() {
  const router = useRouter()
  const [rollNumber, setRollNumber] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (rollNumber.trim()) {
      router.push(`/my-rank/${rollNumber.trim().toUpperCase()}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Check Your Rank</h1>
            <p className="text-muted-foreground">
              Enter your roll number to see your estimated merit rank
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Roll Number Lookup</CardTitle>
              <CardDescription>
                Search for your entry to view detailed rank information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="rollNumber">Roll Number</FieldLabel>
                    <div className="flex gap-2">
                      <Input
                        id="rollNumber"
                        placeholder="Enter your roll number"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit">
                        <Search className="size-4" />
                        Search
                      </Button>
                    </div>
                    <FieldDescription>
                      The roll number you used when submitting your entry
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
