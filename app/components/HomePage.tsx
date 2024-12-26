'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UserForm from './UserForm';

interface User {
    id: number;
    email: string;
    name: string;
    profile: {
        bio: string;
    } | null;
    createdAt: string;
    logs: {
        action: string;
        details: string;
        createdAt: string;
    }[];
}

export default function HomePage() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedFields, setSelectedFields] = useState<string[]>(['name', 'email', 'bio']);
    const [showUserLogs, setShowUserLogs] = useState(false);

    const fetchUsers = async () => {
        try {
            const fields = ['id', ...selectedFields].join(',');
            const withLogs = showUserLogs ? 'true' : 'false';
            const response = await fetch(`/api/users?fields=${fields}&withProfile=true&withLogs=${withLogs}`);
            const data = await response.json();

            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                console.error('Unexpected API response:', data);
                setUsers([]);
                alert('사용자 목록을 가져오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]);
            alert('사용자 목록을 가져오는데 실패했습니다.');
        }
    };

    const handleFieldToggle = (field: string) => {
        setSelectedFields(prev => {
            if (prev.includes(field)) {
                return prev.filter(f => f !== field);
            } else {
                return [...prev, field];
            }
        });
    };

    useEffect(() => {
        fetchUsers();
    }, [selectedFields, showUserLogs]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, name, bio }),
        });

        if (response.ok) {
            setEmail('');
            setName('');
            setBio('');
            fetchUsers();
        }
    };

    const handleDelete = async (userId: number) => {
        if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch(`/api/users?id=${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || '삭제 실패');
            }

            fetchUsers();
        } catch (error) {
            console.error('Delete error:', error);
            alert('사용자 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingUser) {
            console.error('No user selected for editing');
            alert('수정할 사용자가 선택되지 않았습니다.');
            return;
        }

        try {
            console.log('editingUser:', editingUser);
            console.log('editingUser.id:', editingUser.id);

            const response = await fetch(`/api/users?id=${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingUser.id,
                    email,
                    name,
                    bio,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || '수정 실패');
            }

            await fetchUsers();
            setEmail('');
            setName('');
            setBio('');
            setEditingUser(null);
        } catch (error) {
            console.error('Update error:', error);
            alert('사용자 정보 수정 중 오류가 발생했습니다.');
        }
    };

    const startEditing = (user: User) => {
        if (!user || !user.id) {
            console.error('Invalid user object:', user);
            return;
        }

        console.log('Starting edit for user:', user);
        setEditingUser(user);
        setEmail(user.email || '');
        setName(user.name || '');
        setBio(user.profile?.bio || '');
    };

    return (
        <main className="p-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">사용자 관리</h1>
                <Link href="/logs" className="text-blue-500 hover:text-blue-700">
                    시스템 로그 보기 →
                </Link>
            </div>

            <div className="mb-4 p-4 border rounded">
                <h2 className="font-semibold mb-2">표시할 필드 선택:</h2>
                <div className="space-x-4">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={selectedFields.includes('name')}
                            onChange={() => handleFieldToggle('name')}
                            className="mr-2"
                        />
                        이름
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={selectedFields.includes('email')}
                            onChange={() => handleFieldToggle('email')}
                            className="mr-2"
                        />
                        이메일
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={selectedFields.includes('bio')}
                            onChange={() => handleFieldToggle('bio')}
                            className="mr-2"
                        />
                        자기소개
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={showUserLogs}
                            onChange={(e) => setShowUserLogs(e.target.checked)}
                            className="mr-2"
                        />
                        최근 활동 로그
                    </label>
                </div>
            </div>

            <UserForm
                email={email}
                name={name}
                bio={bio}
                setEmail={setEmail}
                setName={setName}
                setBio={setBio}
                handleSubmit={editingUser ? handleUpdate : handleSubmit}
                isEditing={!!editingUser}
            />

            <div className="mt-8 space-y-4">
                {Array.isArray(users) && users.map((user) => (
                    <div key={user.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                {selectedFields.includes('name') && (
                                    <h2 className="font-semibold">{user.name}</h2>
                                )}
                                {selectedFields.includes('email') && (
                                    <p className="text-gray-600">{user.email}</p>
                                )}
                                {selectedFields.includes('bio') && user.profile && (
                                    <p className="mt-2">{user.profile.bio}</p>
                                )}

                                {showUserLogs && user.logs && user.logs.length > 0 && (
                                    <div className="mt-4 border-t pt-2">
                                        <h3 className="text-sm font-semibold mb-2">최근 활동:</h3>
                                        <ul className="text-sm space-y-1">
                                            {user.logs.map((log) => (
                                                <li
                                                    key={`${user.id}-${log.createdAt}`}
                                                    className="text-gray-600"
                                                >
                                                    <span className="font-medium">{log.action}</span>
                                                    <span className="mx-1">-</span>
                                                    <span>{log.details}</span>
                                                    <span className="text-gray-400 ml-2">
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="space-x-2">
                                <button
                                    onClick={() => startEditing(user)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    수정
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
} 