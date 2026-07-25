import MetricCard from "./MetricCard";
import { MetricStatus } from "../../lib/metric-helpers";

interface Metric {
  id: string;
  value: string | number;
  status: MetricStatus;
  guidance: string;
}

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map(metric => (
        <MetricCard key={metric.id} {...metric} />
      ))}
    </div>
  );
}
