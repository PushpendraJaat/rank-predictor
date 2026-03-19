import { Header } from '@/components/header'
import { EntryForm } from '@/components/entry-form'

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Submit Your Marks</h1>
            <p className="text-muted-foreground">
              Paste your MP ESB response sheet URL to automatically extract your marks. Your roll number will remain private.
            </p>
            <div className="mt-3 inline-block px-3 py-1.5 bg-primary/10 rounded-md text-sm font-medium text-primary">
              COPA Trade Only
            </div>
          </div>
          <EntryForm />
        </div>
      </main>
    </div>
  )
}
