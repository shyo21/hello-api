'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: number;
  email: string;
  name: string;
  profile?: {
    bio: string;
  };
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

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
    
    await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, bio }),
    });

    setEmail('');
    setName('');
    setBio('');
    fetchUsers();
  };

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <Link href="/logs" className="text-blue-500 hover:text-blue-700">
          시스템 로그 보기 →
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 mr-2"
          />
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 mr-2"
          />
          <input
            type="text"
            placeholder="자기소개"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="border p-2 mr-2"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            추가
          </button>
        </div>
      </form>

      <div>
        <h2 className="text-xl font-bold mb-2">사용자 목록</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id} className="mb-2">
              {user.name} ({user.email})
              {user.profile && <div className="text-sm text-gray-600">Bio: {user.profile.bio}</div>}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
