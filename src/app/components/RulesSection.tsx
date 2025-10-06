// components/RulesSection.tsx

interface RulesSectionProps {
  title: string;
  rules: string[];
}

export default function RulesSection({ title, rules }: RulesSectionProps) {
  return (
    <section className="bg-[#f9f9f9] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
          {title}
        </h2>
        <ul className="space-y-4 list-disc list-inside text-gray-700 text-base md:text-lg leading-relaxed">
          {rules.map((rule, index) => (
            <li key={index}>{rule}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
