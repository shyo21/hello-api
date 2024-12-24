import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET 요청 처리
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: {
                profile: true,
            },
        });
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
        
        // 트랜잭션 시작
        const result = await prisma.$transaction(async (tx) => {
            // 1. 사용자 생성
            const user = await tx.user.create({
                data: {
                    email: body.email,
                    name: body.name,
                },
            });

            // 2. 프로필 생성
            const profile = await tx.profile.create({
                data: {
                    bio: body.bio || '안녕하세요!', // 기본값 설정
                    userId: user.id,
                },
            });

            // 사용자와 프로필 정보를 함께 반환
            return {
                ...user,
                profile,
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: `Failed to create user: ${errorMessage}` }, { status: 500 });
    }
} 