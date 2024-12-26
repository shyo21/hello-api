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

// DELETE 요청 처리
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 프로필 먼저 삭제 (외래 키 제약조건 때문)
            await tx.profile.delete({
                where: { userId: parseInt(id) }
            });

            const user = await tx.user.delete({
                where: { id: parseInt(id) }
            });

            await tx.log.create({
                data: {
                    action: 'DELETE_USER',
                    details: `Deleted user ${user.name} (${user.email})`,
                    userId: parseInt(id)
                }
            });

            return user;
        });

        return NextResponse.json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        await prisma.log.create({
            data: {
                action: 'ERROR',
                details: `Failed to delete user: ${errorMessage}`,
            }
        });
        return NextResponse.json({ error: `Failed to delete user: ${errorMessage}` }, { status: 500 });
    }
}

// PUT 요청 처리
export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const body = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: parseInt(id) },
                data: {
                    name: body.name,
                    email: body.email,
                    profile: {
                        update: {
                            bio: body.bio
                        }
                    }
                },
                include: {
                    profile: true
                }
            });

            await tx.log.create({
                data: {
                    action: 'UPDATE_USER',
                    details: `Updated user ${user.name} (${user.email})`,
                    userId: parseInt(id)
                }
            });

            return user;
        });

        return NextResponse.json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        await prisma.log.create({
            data: {
                action: 'ERROR',
                details: `Failed to update user: ${errorMessage}`,
            }
        });
        return NextResponse.json({ error: `Failed to update user: ${errorMessage}` }, { status: 500 });
    }
} 