'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Log {
    id: number;
    action: string;
    details: string;
    userId: number | null;
    createdAt: string;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        const response = await fetch('/api/logs');
        const data = await response.json();
        setLogs(data);
    };

    return (
        <main className="p-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">시스템 로그</h1>
                <Link href="/" className="text-blue-500 hover:text-blue-700">
                    ← 사용자 관리로 돌아가기
                </Link>
            </div>

            <div className="space-y-4">
                {logs.map((log) => (
                    <div key={log.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between">
                            <span className="font-semibold">{log.action}</span>
                            <span className="text-gray-500">
                                {new Date(log.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <p className="mt-2">{log.details}</p>
                        {log.userId && (
                            <p className="text-sm text-gray-600">User ID: {log.userId}</p>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
} 