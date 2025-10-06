"use client";

import { Mail, Phone, MapPin, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
            />
            <p className="text-gray-600 text-sm">
              শিক্ষার্থীদের জন্য একটি ইন্টারেক্টিভ কুইজ প্ল্যাটফর্ম। জ্ঞান
              পরীক্ষা করুন এবং পুরস্কার জিতুন।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              দ্রুত লিংক
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/rules"
                  className="text-gray-600 hover:text-[color:var(--brand-primary)] text-sm"
                >
                  নিয়মবলি
                </Link>
              </li>
              <li>
                <Link
                  href="/result"
                  className="text-gray-600 hover:text-[color:var(--brand-primary)] text-sm"
                >
                  ফলাফল
                </Link>
              </li>
              <li>
                <Link
                  href="/ask-question"
                  className="text-gray-600 hover:text-[color:var(--brand-primary)] text-sm"
                >
                  জিঙ্গাসা
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-600 hover:text-[color:var(--brand-primary)] text-sm"
                >
                  সচরাচর প্রশ্ন
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              যোগাযোগ
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail
                  className="w-4 h-4"
                  style={{ color: "var(--brand-primary)" }}
                />
                <span className="text-gray-600 text-sm">
                  support@quizcontest.com
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone
                  className="w-4 h-4"
                  style={{ color: "var(--brand-primary)" }}
                />
                <span className="text-gray-600 text-sm">+৮৮০ ১৭XX-XXXXXX</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin
                  className="w-4 h-4 mt-1"
                  style={{ color: "var(--brand-primary)" }}
                />
                <span className="text-gray-600 text-sm">ঢাকা, বাংলাদেশ</span>
              </div>
            </div>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              আপডেট থাকুন
            </h4>
            <p className="text-gray-600 text-sm mb-3">
              নতুন কুইজ এবং আপডেট সম্পর্কে জানতে সাবস্ক্রাইব করুন
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="আপনার ইমেইল"
                className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 border border-gray-300"
              />
              <button className="px-4 py-2 rounded-lg text-sm transition text-white bg-[color:var(--brand-primary)] hover:opacity-90">
                পাঠান
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm flex items-center gap-1">
            © {new Date().getFullYear()} কুইজ প্রতিযোগিতা. তৈরি with{" "}
            <Heart className="w-4 h-4 text-red-500" /> বাংলাদেশে
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-600 hover:text-[color:var(--brand-primary)] text-sm"
            >
              গোপনীয়তা নীতি
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-[color:var(--brand-primary)] text-sm"
            >
              সেবার শর্তাবলী
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
