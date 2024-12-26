"use client";

interface UserFormProps {
    email: string;
    name: string;
    bio: string;
    setEmail: (email: string) => void;
    setName: (name: string) => void;
    setBio: (bio: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

export default function UserForm({
    email,
    name,
    bio,
    setEmail,
    setName,
    setBio,
    handleSubmit,
}: UserFormProps) {
    return (
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
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    추가
                </button>
            </div>
        </form>
    );
}
