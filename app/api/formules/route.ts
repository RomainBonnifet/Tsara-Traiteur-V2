import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const categories = await prisma.categorie.findMany({
    include: {
      formules: true
    }
  })

  return NextResponse.json(categories)
}
