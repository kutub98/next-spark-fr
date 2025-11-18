// "use client";

// import Image from "next/image";
// import { useParams } from "next/navigation";
// import Link from "next/link";

// // Example sponsor data
// const sponsorData = [
//   {
//     id: 1,
//     name: "MA Foundation",
//     image: "/MA.png",
//     description:
//       "MA Foundation শিক্ষার্থীদের শিক্ষা ও দক্ষতা বৃদ্ধিতে সহায়তা করে। NEXT SPARK প্ল্যাটফর্মকে আরও সমৃদ্ধ করতে তাদের অবদান গুরুত্বপূর্ণ।",
//     contributions: [
//       "শিক্ষার্থীদের প্রযুক্তি সহায়তা",
//       "কনটেন্ট ডেভেলপমেন্টে সহযোগিতা",
//       "মাসিক পুরস্কার স্পন্সরশিপ",
//     ],
//     website: "https://example.com",
//   },
//   {
//     id: 2,
//     name: "SOHA Group",
//     image: "/soha-2.png",
//     description:
//       "SOHA Group বাংলাদেশের শীর্ষ শিক্ষা ও প্রযুক্তি সহায়ক প্রতিষ্ঠান। NEXT SPARK এ তাদের অংশীদারিত্ব শিক্ষার মান বৃদ্ধি করেছে।",
//     contributions: [
//       "কুইজ সফটওয়্যার সাপোর্ট",
//       "ইভেন্ট স্পন্সরশিপ",
//       "ডিজাইন ও ব্র্যান্ডিং সহযোগিতা",
//     ],
//     website: "https://example.com",
//   },
// ];

// export default function SponsoredDetailsPage() {
//   const { id } = useParams();
//   const sponsor = sponsorData.find((item) => item.id === Number(id));

//   if (!sponsor) {
//     return (
//       <div className="container mx-auto py-20 text-center">
//         <h2 className="text-2xl font-bold text-red-500">Sponsor Not Found</h2>
//         <Link href="/" className="text-blue-600 underline mt-4 inline-block">
//           Go Back Home
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-16 max-w-4xl">
//       {/* Sponsor Header */}
//       <div className="flex flex-col gap-6 border-b pb-6 mb-8">
//         <Image
//           src={sponsor.image}
//           alt={sponsor.name}
//           width={150}
//           height={80}
//           className="object-contain"
//         />
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">{sponsor.name}</h1>
//           <p className="text-gray-600 mt-2">{sponsor.description}</p>
//         </div>
//       </div>

//       {/* Contributions Section */}
//       <div className="mb-8">
//         <h2 className="text-xl font-semibold text-gray-800 mb-4">
//           স্পন্সরের অবদান
//         </h2>
//         <ul className="list-disc list-inside text-gray-700 space-y-2">
//           {sponsor.contributions.map((point, idx) => (
//             <li key={idx}>{point}</li>
//           ))}
//         </ul>
//       </div>

//       {/* Website & CTA */}
//       <div className="flex flex-col md:flex-row items-center gap-4 mb-12">
//         <a
//           href={sponsor.website}
//           target="_blank"
//           className="px-6 py-2 bg-[color:var(--brand-primary)] text-white rounded-md hover:opacity-90 transition text-center"
//         >
//           Visit Website
//         </a>
//         <Link
//           href="/"
//           className="text-gray-600 hover:text-[color:var(--brand-primary)]"
//         >
//           ← Back to Home
//         </Link>
//       </div>
//     </div>
//   );
// }

"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";

const sponsorData = [
  {
    id: 1,
    name: "MA Foundation",
    image: "/MA.png",
    tagline: "Empowering Education for the Next Generation",
    description:
      "MA Foundation শিক্ষার্থীদের শিক্ষা ও দক্ষতা বৃদ্ধিতে সহায়তা করে। NEXT SPARK প্ল্যাটফর্মকে আরও সমৃদ্ধ করতে তাদের অবদান অত্যন্ত গুরুত্বপূর্ণ।",
    contributions: [
      "শিক্ষার্থীদের প্রযুক্তি সহায়তা",
      "কনটেন্ট ডেভেলপমেন্টে সহযোগিতা",
      "মাসিক পুরস্কার স্পন্সরশিপ",
    ],
    website: "https://example.com",
  },
  {
    id: 2,
    name: "SOHA Group",
    image: "/soha-2.png",
    tagline: "Leading Innovation for Bangladesh",
    description:
      "SOHA Group বাংলাদেশের শীর্ষ শিক্ষা ও প্রযুক্তি সহায়ক প্রতিষ্ঠান। NEXT SPARK এর সাথে তাদের অংশীদারিত্ব শিক্ষার মান বৃদ্ধি করেছে।",
    contributions: [
      "কুইজ সফটওয়্যার সাপোর্ট",
      "ইভেন্ট স্পন্সরশিপ",
      "ডিজাইন ও ব্র্যান্ডিং সহযোগিতা",
    ],
    website: "https://example.com",
  },
];

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
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col md:flex-row items-start gap-4 mb-12">
        {/* Logo */}
        <div className="flex-shrink-0 ">
          <Image
            src={sponsor.image}
            alt={sponsor.name}
            width={200}
            height={100}
            className="object-contain"
          />
        </div>

        {/* Sponsor Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{sponsor.name}</h1>
          <p className="text-gray-500 mt-2 italic">{sponsor.tagline}</p>
          <p className="text-gray-700 mt-4 leading-relaxed">
            {sponsor.description}
          </p>
        </div>
      </div>

      {/* ---------- Contributions ---------- */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-12 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          এই স্পন্সরের অবদান
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          {sponsor.contributions.map((point, idx) => (
            <li key={idx}>{point}</li>
          ))}
        </ul>
      </div>

      {/* ---------- CTA / Website ---------- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <a
          href={sponsor.website}
          target="_blank"
          className="px-6 py-3 bg-[color:var(--brand-primary)] text-white rounded-md hover:opacity-90 shadow-md transition text-center"
        >
          Visit Official Website
        </a>
        <Link
          href="/"
          className="text-gray-600 hover:text-[color:var(--brand-primary)]"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
