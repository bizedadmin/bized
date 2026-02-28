import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CookiesPage() {
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
                    <h1 className="text-4xl font-bold text-[var(--color-on-surface)] mb-8">Cookie Policy</h1>
                    <p className="text-[var(--color-on-surface)]/80 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="space-y-6 text-[var(--color-on-surface)]/80">
                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">1. Introduction</h2>
                            <p>
                                This Cookie Policy explains how <strong>Bized App Ltd</strong> ("we", "us", and "our") uses cookies and similar technologies to recognize you when you visit our website at Bized.app ("Website"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">2. What are Cookies?</h2>
                            <p>
                                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                            </p>
                            <p className="mt-2">
                                Cookies set by the website owner (in this case, Bized App Ltd) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">3. Why We Use Cookies</h2>
                            <p>
                                We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties. Third parties serve cookies through our Website for advertising, analytics, and other purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">4. Types of Cookies We Use</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-medium text-[var(--color-on-surface)] mb-2">Essential Cookies</h3>
                                    <p>
                                        These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-[var(--color-on-surface)] mb-2">Performance & Analytics Cookies</h3>
                                    <p>
                                        These cookies collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are, or to help us customize our Website for you.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-[var(--color-on-surface)] mb-2">Functionality Cookies</h3>
                                    <p>
                                        These cookies are used to enhance the performance and functionality of our Website but are non-essential to their use. However, without these cookies, certain functionality (like videos) may become unavailable.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-[var(--color-on-surface)] mb-2">Targeting & Advertising Cookies</h3>
                                    <p>
                                        These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">5. Third-Party Integrations</h2>
                            <p>
                                Our Website may use third-party services that place cookies on your device. Specifically:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li><strong>Google:</strong> We use Google services for analytics (Google Analytics) and authentication (Google Sign-In).</li>
                                <li><strong>Meta (Facebook):</strong> We use Meta services to facilitate login (Facebook Login) and potentially for advertising effectiveness measurement.</li>
                                <li><strong>Apple:</strong> We enable Sign in with Apple, which may utilize cookies for authentication purposes.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">6. How Can I Control Cookies?</h2>
                            <p>
                                You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your browser preferences. The "Help" section of the toolbar on most browsers will tell you how to prevent your computer from accepting new cookies, how to have the browser notify you when you receive a new cookie, or how to disable cookies altogether.
                            </p>
                            <p className="mt-2">
                                Please note that if you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">7. Updates to This Policy</h2>
                            <p>
                                We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">8. Contact Us</h2>
                            <p>
                                If you have any questions about our use of cookies or other technologies, please contact us at:
                            </p>
                            <p className="mt-2 font-medium">Bized App Ltd</p>
                            <p>support@bized.app</p>
                        </section>
                    </div>
                </article>
            </div>
        </main>
    );
}
