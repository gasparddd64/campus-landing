"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/home", label: "Cohort" },
  { href: "/listings", label: "Listings" },
  { href: "/members", label: "Members" },
  { href: "/messages", label: "Messages" },
  { href: "/settings", label: "Settings" },
];

export default function Nav({ campusSlug }: { campusSlug?: string }) {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="max-w-4xl mx-auto px-4 flex items-center gap-6 h-14">
        <span className="font-bold text-indigo-600 mr-2">CampusLanding</span>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith(link.href)
                ? "text-indigo-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {link.label}
          </Link>
        ))}
        {campusSlug && (
          <Link
            href={`/guide/${campusSlug}`}
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith("/guide")
                ? "text-indigo-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Guide
          </Link>
        )}
        <form action="/auth/signout" method="POST" className="ml-auto">
          <button className="text-sm text-gray-400 hover:text-gray-600">
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
