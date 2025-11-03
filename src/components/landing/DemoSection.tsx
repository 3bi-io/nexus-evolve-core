import { EnhancedInteractiveDemo } from './EnhancedInteractiveDemo';

export function DemoSection() {
  return (
    <section className="py-16">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Experience Oneiros in 30 Seconds</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Click any prompt below to see multi-agent AI, voice capabilities, and enterprise security in action.
          <br />
          <strong className="text-foreground">No signup required.</strong>
        </p>
      </div>
      <EnhancedInteractiveDemo />
    </section>
  );
}
