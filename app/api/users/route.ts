import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET 요청 처리
export async function GET() {
    try {
        const users = await prisma.$transaction(async (tx) => {
            const users = await tx.user.findMany({
                include: {
                    profile: true,
                },
            });

            await tx.log.create({
                data: {
                    action: 'GET_USERS',
                    details: `Retrieved ${users.length} users`,
                }
            });

            return users;
        });

        return NextResponse.json(users);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        await prisma.log.create({
            data: {
                action: 'ERROR',
                details: `Failed to fetch users: ${errorMessage}`,
            }
        });
        return NextResponse.json({ error: `Failed to fetch users: ${errorMessage}` }, { status: 500 });
    }
}

// POST 요청 처리
export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: body.email,
                    name: body.name,
                },
            });

            const profile = await tx.profile.create({
                data: {
                    bio: body.bio || '안녕하세요!',
                    userId: user.id,
                },
            });

            await tx.log.create({
                data: {
                    action: 'CREATE_USER',
                    details: `Created user ${user.name} (${user.email}) with profile`,
                    userId: user.id,
                }
            });

            return {
                ...user,
                profile,
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        await prisma.log.create({
            data: {
                action: 'ERROR',
                details: `Failed to create user: ${errorMessage}`,
            }
        });
        return NextResponse.json({ error: `Failed to create user: ${errorMessage}` }, { status: 500 });
    }
} 