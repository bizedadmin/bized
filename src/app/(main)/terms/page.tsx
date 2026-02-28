import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
                    <h1 className="text-4xl font-bold text-[var(--color-on-surface)] mb-8">Terms of Service</h1>
                    <p className="text-[var(--color-on-surface)]/80 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="space-y-6 text-[var(--color-on-surface)]/80">
                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">1. Agreement to Terms</h2>
                            <p>
                                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and <strong>Bized App Ltd</strong> ("Company," "we," "us," or "our"), concerning your access to and use of the Bized application and website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
                            </p>
                            <p className="mt-2">
                                By accessing the Site, you confirm that you have read, understood, and agreed to be bound by all of these Terms of Service. If you do not agree with all of these terms, then you are expressly prohibited from using the Site and you must discontinue use immediately.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">2. Intellectual Property Rights</h2>
                            <p>
                                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">3. User Representations</h2>
                            <p>
                                By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Service; and (4) you are not a minor in the jurisdiction in which you reside.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">4. Prohibited Activities</h2>
                            <p>
                                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">5. User Generated Contributions</h2>
                            <p>
                                The Site may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Site, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions").
                            </p>
                            <p className="mt-2">
                                When you create or make available any Contributions, you thereby represent and warrant that your Contributions do not violate the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">6. Management of the Site</h2>
                            <p>
                                We reserve the right, but not the obligation, to: (1) monitor the Site for violations of these Terms of Service; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Terms of Service; and (3) otherwise manage the Site in a manner designed to protect our rights and property and to facilitate the proper functioning of the Site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">7. Term and Termination</h2>
                            <p>
                                These Terms of Service shall remain in full force and effect while you use the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF SERVICE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SITE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE TERMS OF SERVICE OR OF ANY APPLICABLE LAW OR REGULATION.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">8. Modifications and Interruptions</h2>
                            <p>
                                We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. We also reserve the right to modify or discontinue all or part of the Site without notice at any time. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">9. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and defined following the laws of the United Kingdom. Bized App Ltd and yourself irrevocably consent that the courts of the United Kingdom shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-[var(--color-on-surface)] mb-4">10. Contact Us</h2>
                            <p>
                                In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
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
