import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface MacroPieChartProps {
  protein: number;
  carbs: number;
  fat: number;
}

const COLORS = {
  protein: "#A9B887", // Sage Green
  carbs: "#A9B887",   // Amber
  fat: "#8C6D53",     // Walnut / Warm Earth
};

export function MacroPieChart({ protein, carbs, fat }: MacroPieChartProps) {
  const proteinCal = protein * 4;
  const carbsCal = carbs * 4;
  const fatCal = fat * 9;
  const total = proteinCal + carbsCal + fatCal;

  const data = [
    {
      name: "Carbs",
      value: carbs,
      calories: carbsCal,
      percentage: total > 0 ? Math.round((carbsCal / total) * 100) : 0,
    },
    {
      name: "Protein",
      value: protein,
      calories: proteinCal,
      percentage: total > 0 ? Math.round((proteinCal / total) * 100) : 0,
    },
    {
      name: "Fat",
      value: fat,
      calories: fatCal,
      percentage: total > 0 ? Math.round((fatCal / total) * 100) : 0,
    },
  ];

  const renderLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={90}
          innerRadius={50}
          paddingAngle={3}
          dataKey="calories"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.name === "Carbs"
                  ? COLORS.carbs
                  : entry.name === "Protein"
                    ? COLORS.protein
                    : COLORS.fat
              }
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#202B1C",
            border: "1px solid rgba(169, 184, 135, 0.3)",
            borderRadius: "12px",
            color: "#E8E9DF",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            padding: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
          }}
          formatter={(value: any, name: any, props: any) => [
            `${props?.payload?.value ?? value}g (${props?.payload?.calories ?? 0} kcal)`,
            name,
          ]}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          formatter={(value: string) => (
            <span style={{ color: "var(--color-foreground, #E8E9DF)", fontSize: "13px", fontWeight: 500 }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
