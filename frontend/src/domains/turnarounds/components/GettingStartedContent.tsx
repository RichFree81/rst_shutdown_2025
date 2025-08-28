export default function GettingStartedContent() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy mb-4">Welcome to Turnarounds</h1>
        <div className="bg-brand-bluegrey-50 border-l-4 border-brand-copper-300 p-4 rounded-r-md">
          <p className="text-lg text-brand-navy font-medium mb-2">
            Get started with managing your plant turnaround operations efficiently and safely.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-brand-navy mb-3">What are Turnarounds?</h2>
          <p className="text-text-primary leading-relaxed">
            Turnarounds are planned, periodic shutdowns of industrial facilities for maintenance, inspection, 
            and equipment upgrades. These critical operations ensure plant safety, regulatory compliance, 
            and optimal performance while minimizing unplanned downtime and operational risks.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-brand-navy mb-3">What This Domain Addresses</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-brand-bluegrey-200 rounded-lg p-4">
              <h3 className="font-medium text-brand-navy mb-2">Work Package Management</h3>
              <p className="text-sm text-text-secondary">
                Organize and track maintenance tasks, inspections, and equipment installations across your turnaround project.
              </p>
            </div>
            <div className="bg-white border border-brand-bluegrey-200 rounded-lg p-4">
              <h3 className="font-medium text-brand-navy mb-2">Resource Planning</h3>
              <p className="text-sm text-text-secondary">
                Coordinate personnel, equipment, and materials to ensure efficient execution and minimize downtime.
              </p>
            </div>
            <div className="bg-white border border-brand-bluegrey-200 rounded-lg p-4">
              <h3 className="font-medium text-brand-navy mb-2">Safety & Compliance</h3>
              <p className="text-sm text-text-secondary">
                Maintain safety standards and regulatory compliance throughout all turnaround activities.
              </p>
            </div>
            <div className="bg-white border border-brand-bluegrey-200 rounded-lg p-4">
              <h3 className="font-medium text-brand-navy mb-2">Progress Tracking</h3>
              <p className="text-sm text-text-secondary">
                Monitor real-time progress, identify bottlenecks, and make data-driven decisions to stay on schedule.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-brand-copper-50 border border-brand-copper-200 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-brand-navy mb-3">Getting Started</h2>
          <p className="text-text-primary mb-3">
            Begin by exploring the navigation tree on the left to access different areas of turnaround management:
          </p>
          <ul className="list-disc list-inside space-y-1 text-text-secondary">
            <li>Browse work packages to see planned maintenance activities</li>
            <li>Check dashboards for project overview and key metrics</li>
            <li>Configure settings for your turnaround preferences</li>
            <li>Stay updated with notifications and alerts</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
