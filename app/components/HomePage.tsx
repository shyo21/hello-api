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
}

export default function HomePage() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedFields, setSelectedFields] = useState<string[]>(['name', 'email', 'bio']);

    const fetchUsers = async () => {
        const fields = selectedFields.join(',');
        const response = await fetch(`/api/users?fields=${fields}`);
        const data = await response.json();
        setUsers(data);
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
    }, [selectedFields]);

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

        const response = await fetch(`/api/users?id=${userId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            fetchUsers();
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        const response = await fetch(`/api/users?id=${editingUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                name,
                bio,
            }),
        });

        if (response.ok) {
            setEditingUser(null);
            setEmail('');
            setName('');
            setBio('');
            fetchUsers();
        }
    };

    const startEditing = (user: User) => {
        setEditingUser(user);
        setEmail(user.email);
        setName(user.name);
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
                {users.map((user) => (
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