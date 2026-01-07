'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
        >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
        </button>
    );
}
