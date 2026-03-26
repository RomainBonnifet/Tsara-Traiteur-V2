import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.categorie.findMany({
    include: {
      formules: true
    }
  })

  return NextResponse.json(categories)
}
