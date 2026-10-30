import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface WeightProgressChartProps {
  currentWeight: number;
  targetWeight: number | undefined;
  weeklyChange: number;
  weeks: number;
}

export function WeightProgressChart({
  currentWeight,
  targetWeight,
  weeklyChange,
  weeks,
}: WeightProgressChartProps) {
  // Generate projection data
  const data = [];
  const maxWeeks = Math.min(weeks || 12, 52); // Cap at 1 year
  
  for (let week = 0; week <= maxWeeks; week++) {
    const projectedWeight = currentWeight + weeklyChange * week;
    data.push({
      week,
      weight: Math.round(projectedWeight * 10) / 10,
    });
  }

  // Determine Y-axis domain with some padding
  const allWeights = data.map((d) => d.weight);
  if (targetWeight) allWeights.push(targetWeight);
  const minWeight = Math.min(...allWeights);
  const maxWeight = Math.max(...allWeights);
  const padding = Math.max(1, (maxWeight - minWeight) * 0.15);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(169, 184, 135, 0.2)"
          opacity={0.6}
        />
        <XAxis
          dataKey="week"
          stroke="rgba(232, 233, 223, 0.6)"
          tick={{ fill: "#E8E9DF", fontSize: 12 }}
          tickLine={{ stroke: "rgba(169, 184, 135, 0.2)" }}
          label={{
            value: "Weeks",
            position: "insideBottom",
            offset: -5,
            style: {
              fill: "#E8E9DF",
              fontSize: 12,
              fontFamily: "Inter, sans-serif",
            },
          }}
        />
        <YAxis
          stroke="rgba(232, 233, 223, 0.6)"
          tick={{ fill: "#E8E9DF", fontSize: 12 }}
          tickLine={{ stroke: "rgba(169, 184, 135, 0.2)" }}
          domain={[
            Math.floor(minWeight - padding),
            Math.ceil(maxWeight + padding),
          ]}
          label={{
            value: "Weight (kg)",
            angle: -90,
            position: "insideLeft",
            style: {
              fill: "#E8E9DF",
              fontSize: 12,
              fontFamily: "Inter, sans-serif",
            },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#202B1C",
            border: "1px solid rgba(169, 184, 135, 0.3)",
            borderRadius: "12px",
            color: "#E8E9DF",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            padding: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
          }}
          labelFormatter={(week) => `Week ${week}`}
          formatter={(value: any) => [`${value} kg`, "Projected Weight"]}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#A9B887"
          strokeWidth={3}
          dot={{ fill: "#A9B887", r: 4 }}
          activeDot={{ r: 6 }}
        />
        {targetWeight && (
          <ReferenceLine
            y={targetWeight}
            stroke="#A9B887"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: `Target: ${targetWeight} kg`,
              position: "right",
              fill: "#A9B887",
              fontSize: 12,
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
            }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
