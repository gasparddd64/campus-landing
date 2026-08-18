import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Campus Landing",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Home
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Privacy Policy</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 space-y-6">
          <div>
            <p className="text-sm text-gray-400 mb-2">Last updated: August 2025</p>
            <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          </div>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. What we collect</h2>
            <p className="text-sm text-gray-700">
              We collect the information you provide when you create an account: your email address, display name, program, languages, country of origin (optional), and intake cohort. We also collect content you post (listings, feed posts, messages) and usage data to improve the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. How we use your data</h2>
            <p className="text-sm text-gray-700">
              Your data is used to provide the Campus Landing service: connecting you with your cohort, showing your listings, enabling messaging with other students. We do not sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Who can see your profile</h2>
            <p className="text-sm text-gray-700">
              Your profile (display name, program, languages) is visible to other verified students on your campus. Your email is never shown publicly. Your country of origin is only shown if you choose to make it visible during onboarding.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Data storage</h2>
            <p className="text-sm text-gray-700">
              Your data is stored securely using Supabase (PostgreSQL) with row-level security. We use Vercel for hosting. Data is stored in the United States.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Your rights</h2>
            <p className="text-sm text-gray-700">
              You can export all your data or delete your account at any time from the Settings page. Upon deletion, your profile and all associated content is permanently removed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Weekly digest</h2>
            <p className="text-sm text-gray-700">
              If you opt in, we send a weekly summary email via Resend. You can unsubscribe at any time from Settings or via the unsubscribe link in the email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Analytics</h2>
            <p className="text-sm text-gray-700">
              We use PostHog for privacy-respecting product analytics. No personal data is shared with PostHog beyond anonymous usage events.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Contact</h2>
            <p className="text-sm text-gray-700">
              Questions? Email us at privacy@campuslanding.app
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
