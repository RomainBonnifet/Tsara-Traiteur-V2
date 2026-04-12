import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const extras = await prisma.extra.findMany({
    where: { disponible: true }
  })
  return NextResponse.json(extras)
}
