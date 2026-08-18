import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Campus Landing",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Home
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Terms of Service</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 space-y-6">
          <div>
            <p className="text-sm text-gray-400 mb-2">Last updated: August 2025</p>
            <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
          </div>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Eligibility</h2>
            <p className="text-sm text-gray-700">
              Campus Landing is available to verified students of partner universities. You must use your official university email address to register. By using the service, you confirm that you are a current or incoming student at a partner institution.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Acceptable use</h2>
            <p className="text-sm text-gray-700">
              You agree not to post fraudulent listings, harass other users, share illegal content, or circumvent the security features of the platform. Violations may result in immediate account suspension.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Listings and transactions</h2>
            <p className="text-sm text-gray-700">
              Campus Landing facilitates connections between students but is not a party to any transaction. We strongly recommend meeting in person before any financial exchange. We are not liable for any fraud, dispute, or loss arising from user interactions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Content ownership</h2>
            <p className="text-sm text-gray-700">
              You retain ownership of content you post. By posting, you grant Campus Landing a license to display that content to other verified users of your campus. We do not sell or externally distribute your content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Account termination</h2>
            <p className="text-sm text-gray-700">
              We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from the Settings page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Limitation of liability</h2>
            <p className="text-sm text-gray-700">
              Campus Landing is provided as-is. To the maximum extent permitted by law, we are not liable for any damages arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Changes</h2>
            <p className="text-sm text-gray-700">
              We may update these terms. We will notify you of significant changes via email. Continued use of the platform after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Contact</h2>
            <p className="text-sm text-gray-700">
              Questions? Email us at legal@campuslanding.app
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t border-gray-100 bg-white mt-8">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-wrap gap-4 text-xs text-gray-400 justify-center">
          <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-600">Terms</Link>
          <Link href="/guide/uva" className="hover:text-gray-600">Campus Guide</Link>
        </div>
      </footer>
    </div>
  );
}
