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

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
    };

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

    return (
        <main className="p-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">사용자 관리</h1>
                <Link href="/logs" className="text-blue-500 hover:text-blue-700">
                    시스템 로그 보기 →
                </Link>
            </div>
            
            <UserForm
                email={email}
                name={name}
                bio={bio}
                setEmail={setEmail}
                setName={setName}
                setBio={setBio}
                handleSubmit={handleSubmit}
            />

            <div className="mt-8 space-y-4">
                {users.map((user) => (
                    <div key={user.id} className="border p-4 rounded-lg">
                        <h2 className="font-semibold">{user.name}</h2>
                        <p className="text-gray-600">{user.email}</p>
                        {user.profile && (
                            <p className="mt-2">{user.profile.bio}</p>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
} 