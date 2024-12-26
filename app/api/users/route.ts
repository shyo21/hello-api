import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET 요청 처리
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fields = searchParams.get('fields')?.split(',') || ['id', 'name', 'email'];
        const withProfile = searchParams.get('withProfile') === 'true';
        const withLogs = searchParams.get('withLogs') === 'true';
        
        // 기본 select 객체 생성
        const selectFields: Record<string, boolean | object> = {};
        fields.forEach(field => {
            if (['id', 'name', 'email', 'createdAt'].includes(field)) {
                selectFields[field] = true;
            }
        });

        // 관계 쿼리 설정
        if (withProfile) {
            selectFields.profile = {
                select: {
                    bio: true,
                    createdAt: true,
                }
            };
        }

        if (withLogs) {
            selectFields.logs = {
                select: {
                    action: true,
                    details: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5 // 최근 5개의 로그만 가져오기
            };
        }

        const users = await prisma.$transaction(async (tx) => {
            try {
                const users = await tx.user.findMany({
                    select: selectFields,
                    orderBy: {
                        createdAt: 'desc'
                    }
                });

                await tx.log.create({
                    data: {
                        action: 'GET_USERS',
                        details: `Retrieved ${users.length} users with fields: ${fields.join(', ')}`,
                    }
                });

                return users;
            } catch (error) {
                throw error; // 트랜잭션 롤백을 위해 에러를 다시 던짐
            }
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
        // 명확한 에러 응답 구조
        return NextResponse.json({ 
            error: true,
            message: `Failed to fetch users: ${errorMessage}`,
            users: [] 
        }, { status: 500 });
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

        const userId = parseInt(id);

        const result = await prisma.$transaction(async (tx) => {
            // 먼저 사용자가 존재하는지 확인
            const existingUser = await tx.user.findUnique({
                where: { id: userId },
                include: { profile: true }
            });

            if (!existingUser) {
                throw new Error('User not found');
            }

            // 삭제 전에 로그 생성
            await tx.log.create({
                data: {
                    action: 'DELETE_USER',
                    details: `Deleting user ${existingUser.name} (${existingUser.email})`,
                    userId: userId
                }
            });

            // 프로필이 있는 경우에만 삭제
            if (existingUser.profile) {
                await tx.profile.delete({
                    where: { userId: userId }
                });
            }

            // 마지막으로 사용자 삭제
            const deletedUser = await tx.user.delete({
                where: { id: userId }
            });

            return deletedUser;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Delete error:', error);
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

        const userId = parseInt(id);

        const result = await prisma.$transaction(async (tx) => {
            // 먼저 사용자 업데이트
            const user = await tx.user.update({
                where: { id: userId },
                data: {
                    name: body.name,
                    email: body.email,
                },
            });

            // 그 다음 프로필 업데이트 또는 생성
            const profile = await tx.profile.upsert({
                where: { userId: userId },
                create: {
                    bio: body.bio,
                    userId: userId,
                },
                update: {
                    bio: body.bio,
                },
            });

            await tx.log.create({
                data: {
                    action: 'UPDATE_USER',
                    details: `Updated user ${user.name} (${user.email})`,
                    userId: userId
                }
            });

            return {
                ...user,
                profile,
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Update error:', error);
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