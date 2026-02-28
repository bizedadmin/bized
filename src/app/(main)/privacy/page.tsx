import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
                    <h1 className="text-4xl font-bold text-[var(--color-on-surface)] mb-8">Privacy Policy</h1>
                    <p className="text-[var(--color-on-surface)]/80 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="space-y-6 text-[var(--color-on-surface)]/80">
                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">1. Introduction</h2>
                            <p>
                                Welcome to Bized, operated by <strong>Bized App Ltd</strong> ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">2. The Data We Collect About You</h2>
                            <p>
                                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li><strong>Identity Data</strong> includes first name, maiden name, last name, username or similar identifier.</li>
                                <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                                <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
                                <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">3. Information from Third-Party Social Media Services</h2>
                            <p className="mb-2">
                                We allow you to create an account and log in to use the Service through the following Third-party Social Media Services:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Google</li>
                                <li>Facebook</li>
                                <li>Apple</li>
                            </ul>
                            <p className="mt-2">
                                If you decide to register through or otherwise grant us access to a Third-Party Social Media Service, we may collect Personal data that is already associated with your Third-Party Social Media Service's account, such as your name, your email address, your activities or your contact list associated with that account.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">4. Google User Data Policy</h2>
                            <p className="mb-4">
                                Our application uses Google APIs to provide enhanced features. We adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.
                            </p>

                            <h3 className="text-xl font-medium text-[var(--color-on-surface)] mb-2">Data Accessed</h3>
                            <p className="mb-4">
                                If you choose to connect your Google account, we may access the following data based on your explicit consent:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-1">
                                <li><strong>Basic Profile Information:</strong> Your name, email address, and profile picture to facilitate account creation and login.</li>
                                <li><strong>Google Shopping Data:</strong> If you use our "Multi-Channel Sync" feature, we access product data to sync your inventory with Google Shopping.</li>
                            </ul>

                            <h3 className="text-xl font-medium text-[var(--color-on-surface)] mb-2">Data Usage</h3>
                            <p className="mb-4">
                                We use the Google user data we access solely for:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-1">
                                <li>Authenticating you and managing your account.</li>
                                <li>Enabling the syncing of your product catalog with Google Shopping services as requested by you.</li>
                                <li>Facilitating payments via Google Pay if utilized.</li>
                            </ul>
                            <p className="mb-4">
                                We do <strong>not</strong> use Google user data for advertising, surveillance, or any other purpose not explicitly authorized by you.
                            </p>

                            <h3 className="text-xl font-medium text-[var(--color-on-surface)] mb-2">Data Sharing</h3>
                            <p className="mb-4">
                                We do not share your Google user data with third parties, except:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-1">
                                <li>As necessary to provide the features you have requested (e.g., syncing with Google Shopping).</li>
                                <li>To comply with applicable laws or regulations.</li>
                                <li>With service providers who act on our behalf to support our application, who are bound by confidentiality obligations.</li>
                            </ul>

                            <h3 className="text-xl font-medium text-[var(--color-on-surface)] mb-2">Data Storage & Protection</h3>
                            <p className="mb-4">
                                We employ industry-standard security measures to protect your data, including encryption in transit and at rest. Your Google user data is stored in secure databases with restricted access limited to authorized personnel only.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">5. Facebook User Data Policy</h2>
                            <p className="mb-4">
                                Our application allows you to sign in using your Facebook account. We comply with the <a href="https://developers.facebook.com/terms" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">Facebook Platform Terms</a> and Data Policy.
                            </p>

                            <h3 className="text-xl font-medium text-[var(--color-on-surface)] mb-2">Data Accessed</h3>
                            <p className="mb-4">
                                With your permission, we access the following public profile information:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-1">
                                <li><strong>Name and Profile Picture:</strong> To create your user profile in our application.</li>
                                <li><strong>Email Address:</strong> To serve as your unique identifier and for communication purposes.</li>
                            </ul>

                            <h3 className="text-xl font-medium text-[var(--color-on-surface)] mb-2">Data Usage & Sharing</h3>
                            <p className="mb-4">
                                We use this data solely for authentication and account management. We do not share your Facebook user data with third parties or use it for any purpose other than providing the Service.
                            </p>

                            <h3 className="text-xl font-medium text-[var(--color-on-surface)] mb-2">Data Deletion</h3>
                            <p className="mb-4">
                                In compliance with Facebook's requirements, you can request deletion of your Facebook data. Please see Section 8 (Data Retention & Deletion) below or visit our <Link href="/data-deletion" className="text-[var(--color-primary)] hover:underline">Data Deletion Instructions</Link> page.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">6. Apple User Data Policy</h2>
                            <p className="mb-4">
                                You can sign in using your Apple ID. We respect your privacy and the <a href="https://www.apple.com/legal/privacy/en-ww/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">Apple Privacy Policy</a>.
                            </p>

                            <h3 className="text-xl font-medium text-[var(--color-on-surface)] mb-2">Data Accessed</h3>
                            <p className="mb-4">
                                When you use "Sign in with Apple", we receive:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-1">
                                <li><strong>Name:</strong> As provided by your Apple ID.</li>
                                <li><strong>Email Address:</strong> Either your actual email or a private relay email address ("Hide My Email") if you chose to hide it.</li>
                            </ul>

                            <h3 className="text-xl font-medium text-[var(--color-on-surface)] mb-2">Limited Use</h3>
                            <p className="mb-4">
                                We use this information strictly for account creation, authentication, and communication. We do not track your activity outside of our application or sell your data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">7. How We Use Your Personal Data</h2>
                            <p>
                                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                                <li>Where we need to comply with a legal or regulatory obligation.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">8. Data Retention & Deletion</h2>
                            <p className="mb-4">
                                We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
                            </p>
                            <p className="mb-4">
                                You can request deletion of your data at any time. For detailed instructions on how to request data deletion, please visit our <Link href="/data-deletion" className="text-[var(--color-primary)] hover:underline">Data Deletion Instructions</Link> page.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">9. Data Security</h2>
                            <p>
                                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">10. Contact Us</h2>
                            <p>
                                If you have any questions about this privacy policy or our privacy practices, please contact us at: support@bized.app
                            </p>
                        </section>
                    </div>
                </article>
            </div>
        </main>
    );
}
