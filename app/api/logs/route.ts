import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const logs = await prisma.log.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: 100  // 최근 100개만 가져오기
        });
        return NextResponse.json(logs);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: `Failed to fetch logs: ${errorMessage}` }, { status: 500 });
    }
} 