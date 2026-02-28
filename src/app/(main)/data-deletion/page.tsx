import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DataDeletionPage() {
    return (
        <main className="min-h-screen bg-[var(--color-surface-container-low)] px-4 py-12">
            <div className="container max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/">
                        <Button variant="text" className="pl-0 hover:pl-2 transition-all text-[var(--color-on-surface)]/60 hover:text-[var(--color-on-surface)]">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>

                <article className="prose prose-lg dark:prose-invert max-w-none">
                    <h1 className="text-4xl font-bold text-[var(--color-on-surface)] mb-8">Data Deletion Instructions</h1>
                    <p className="text-[var(--color-on-surface)]/80 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="space-y-6 text-[var(--color-on-surface)]/80">
                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">User Data Deletion</h2>
                            <p>
                                You have the right to request the deletion of your personal data stored on our platform. To initiate a data deletion request, please follow the steps below:
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">Method 1: Account Settings</h2>
                            <p>
                                If you have an active account:
                            </p>
                            <ol className="list-decimal pl-6 mt-2 space-y-2">
                                <li>Log in to your Bized account.</li>
                                <li>Navigate to <strong>Settings</strong> &gt; <strong>Profile</strong>.</li>
                                <li>Scroll to the bottom and click on <strong>Delete Account</strong>.</li>
                                <li>Confirm your choice. This will permanently delete your account and all associated data.</li>
                            </ol>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">Method 2: Contact Support</h2>
                            <p>
                                If you cannot access your account or prefer to contact us directly:
                            </p>
                            <ol className="list-decimal pl-6 mt-2 space-y-2">
                                <li>Send an email to <strong>privacy@bized.app</strong>.</li>
                                <li>Use the subject line "Data Deletion Request".</li>
                                <li>Please include your username or the email address associated with your account.</li>
                            </ol>
                            <p className="mt-4">
                                We will process your request within 30 days and confirm deletion via email.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">Facebook Data Deletion Callback</h2>
                            <p>
                                If you logged in via Facebook, you can also delete your data through your Facebook settings:
                            </p>
                            <ol className="list-decimal pl-6 mt-2 space-y-2">
                                <li>Go to your Facebook Account's Setting & Privacy. Click "Settings".</li>
                                <li>Look for "Apps and Websites" and you will see all of the apps and websites you linked with your Facebook.</li>
                                <li>Search and Click "Bized" in the search bar.</li>
                                <li>Scroll and click "Remove".</li>
                                <li>Congratulations, you have successfully removed your app activities.</li>
                            </ol>
                        </section>
                    </div>
                </article>
            </div>
        </main>
    );
}
