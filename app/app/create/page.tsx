'use client'

import { SimpleCreateBrainForm } from '@/components/app/Auth/SimpleCreateBrainForm'

export default function CreatePage() {
  return <SimpleCreateBrainForm onSuccess={() => window.location.href = '/app/dashboard'} />
}