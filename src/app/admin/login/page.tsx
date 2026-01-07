import { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
    title: 'Admin Login | Bized',
    description: 'Login to the Bized Admin Portal',
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
            <LoginForm />
        </div>
    );
}
