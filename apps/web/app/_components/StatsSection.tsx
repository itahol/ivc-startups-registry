import { Building2, Landmark, Users, Banknote } from "lucide-react";

export function StatsSection() {
  const stats: {
    label: string;
    value: number;
    icon: React.ReactNode;
    testId: string;
  }[] = [
    {
      label: "Active High-Tech Companies",
      value: 8800,
      icon: <Building2 className="h-5 w-5" aria-hidden />,
      testId: "companies",
    },
    {
      label: "Investors",
      value: 2900,
      icon: <Landmark className="h-5 w-5" aria-hidden />,
      testId: "investment-firms",
    },
    {
      label: "Accelerators & Incubators",
      value: 400,
      icon: <Users className="h-5 w-5" aria-hidden />,
      testId: "people",
    },
    {
      label: "MNC",
      value: 500,
      icon: <Banknote className="h-5 w-5" aria-hidden />,
      testId: "funds",
    },
  ];

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 md:px-8 pb-20"
      aria-labelledby="stats-heading"
    >
      <h2
        id="stats-heading"
        className="text-xl font-semibold tracking-tight mb-6"
      >
        Currently Available Profiles
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4" role="list">
        {stats.map((s) => (
          <div
            key={s.label}
            role="listitem"
            data-testid={`stat-${s.testId}`}
            className="group relative overflow-hidden rounded-lg border p-4 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                {s.icon}
                <span className="text-xs font-medium uppercase tracking-wide">
                  {s.label}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span
                data-testid="stat-number"
                className="text-3xl font-semibold tabular-nums"
                style={{ fontVariantNumeric: "tabular-nums" }}
                aria-label={`${s.value} ${s.label}`}
              >
                {s.value.toLocaleString()}+
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
