import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET 요청 처리
export async function GET() {
    try {
        const users = await prisma.user.findMany();
        return NextResponse.json(users);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: `Failed to fetch users: ${errorMessage}` }, { status: 500 });
    }
}

// POST 요청 처리
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const user = await prisma.user.create({
        data: {
            email: body.email,
            name: body.name,
        },
        });
        return NextResponse.json(user);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: `Failed to create user: ${errorMessage}` }, { status: 500 });
    }
} 