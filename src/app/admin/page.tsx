import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LogoutButton from './_components/LogoutButton';

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-2xl w-full text-center">
                <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Admin Portal</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Welcome back, <span className="font-semibold">{session?.user?.name || 'Admin'}</span>
                </p>

                <div className="flex justify-center gap-4">
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}
