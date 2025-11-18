/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";

// Common contributions
const commonContributions = [
  "Technical support sponsorship for the Next Spark Quiz Platform",
  "Financial assistance for platform development",
  "Commitment to advancing digital learning",
  "Empowering the next generation with technical knowledge",
];

// Sponsors list
const sponsorData = [
  {
    id: 2,
    name: "Suha Tex",
    company: "Suha Tex",
    founder: "Mr. Harunur Rashid",
    image: "/soha-2.png",
    tagline: "Ensuring Global-Standard Garments With Technical Excellence",
    contributions: commonContributions,
    website: "https://example.com/suha-tex",
  },
  {
    id: 1,
    name: "Am Tex",
    company: "Am Tex",
    founder: "Mr. Harunur Rashid",
    image: "/MA.png",
    tagline: "Ensuring Global-Standard Garments With Technical Excellence",
    contributions: commonContributions,
    website: "https://example.com/am-tex",
  },
];

// Function to generate dynamic description
const getSponsorDescription = (sponsor: any) => (
  <>
    <p>
      <span className="font-semibold">{sponsor.company}</span> is a prominent
      name in the Ready-Made Garment (RMG) export industry, founded and led by{" "}
      <span className="font-semibold">{sponsor.founder}</span>. With extensive
      experience in the apparel sector dating back to 2008, {sponsor.founder}{" "}
      has built the company on a commitment to quality, global standards, and
      ethical manufacturing practices.
    </p>

    <br />

    <p>
      We specialize in exporting high-quality garments to international markets,
      where technical precision and efficiency are paramount.
    </p>

    <br />

    <p>
      As a company that values technical advancement, we are proud to be the
      Technical Support Sponsor for the{" "}
      <span className="text-primary font-semibold">
        Next Spark Quiz Platform
      </span>
      . This sponsorship represents our strong commitment to investing in
      technology and fostering digital excellence. We provide the necessary
      financial support for the {"platform's"} construction, helping to create a
      valuable resource for knowledge and skill development. Our goal is to
      empower the next generation and contribute to a more technically adept
      future.
    </p>
  </>
);

export default function SponsoredDetailsPage() {
  const { id } = useParams();
  const sponsor = sponsorData.find((item) => item.id === Number(id));

  if (!sponsor) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-red-500">Sponsor Not Found</h2>
        <Link href="/" className="text-blue-600 underline mt-4 inline-block">
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 mb-12">
        <div className="flex flex-col items-start gap-6">
          {/* Sponsor Logo */}
          <Image
            src={sponsor.image}
            alt={sponsor.name}
            width={220}
            height={120}
            className="object-contain drop-shadow-sm"
          />

          {/* Sponsor Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {sponsor.name}
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Company: <span className="font-semibold">{sponsor.company}</span>
            </p>
            <p className="text-lg text-gray-600 mt-1">
              Founder: <span className="font-semibold">{sponsor.founder}</span>
            </p>
            <p className="text-lg text-gray-500 mt-2 italic">
              {sponsor.tagline}
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8"></div>

        <div className="text-gray-700 text-lg leading-relaxed space-y-4">
          {getSponsorDescription(sponsor)}
        </div>
      </div>

      {/* CONTRIBUTIONS SECTION */}
      <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-8 shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          এই স্পন্সরের অবদান
        </h2>

        <ul className="space-y-3">
          {sponsor.contributions.map((point, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-gray-700 text-lg"
            >
              <span className="w-3 h-3 mt-2 rounded-full bg-[color:var(--brand-primary)]"></span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA BUTTON */}
      <div className="flex justify-center mt-12 gap-4 flex-wrap">
        <Link
          href="/"
          className="px-6 py-3 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-700 transition"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
