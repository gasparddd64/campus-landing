import EmailForm from "@/components/auth/EmailForm";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Now available at select US campuses
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Your first 90 days,{" "}
            <span className="text-brand-500">together</span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-lg mx-auto">
            Connect with international students arriving at your campus the same
            month. Find housing, share furniture, handle admin — with people who
            get it.
          </p>

          <EmailForm />

          <p className="mt-4 text-sm text-gray-400">
            Requires a .edu email address. No password needed.
          </p>
        </div>
      </div>

      {/* Value props */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16 grid sm:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: "🏠",
              title: "Housing & furniture",
              body: "Sublets, roommates, and free couches — from people you can actually trust.",
            },
            {
              icon: "🗓️",
              title: "Same cohort, same chaos",
              body: "Everyone in your group arrived the same month. The questions are the same. The answers help everyone.",
            },
            {
              icon: "🔒",
              title: "Campus-only",
              body: "Only verified students from your university. You control what you share.",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-3">
              <span className="text-3xl">{item.icon}</span>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-wrap gap-6 text-xs text-gray-400 justify-center">
          <a href="/privacy" className="hover:text-gray-600">Privacy</a>
          <a href="/terms" className="hover:text-gray-600">Terms</a>
          <a href="/guide/uva" className="hover:text-gray-600">Campus Guide</a>
        </div>
      </footer>
    </main>
  );
}
