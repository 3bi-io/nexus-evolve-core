import { ComparisonTable } from '@/components/conversion/ComparisonTable';

export function ComparisonSection() {
  return (
    <section className="py-16">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Not Just Another AI Chatbot</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          See how Oneiros compares to ChatGPT, Claude, and traditional AI platforms
        </p>
      </div>
      <ComparisonTable />
    </section>
  );
}
