import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type RevenuePoint = { month: string; value: number };

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <Card className="overflow-hidden rounded-[24px] border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
      <CardHeader>
        <div>
          <CardTitle>Revenue overview</CardTitle>
          <CardDescription>Monthly booking totals from the current dataset.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[20rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
              <YAxis
                width={60}
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                fontSize={12}
                tickFormatter={(value) => `$${Number(value) / 1000}k`}
              />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.08)" }}
                contentStyle={{
                  background: "rgba(255,255,255,0.98)",
                  border: "1px solid rgba(148,163,184,0.18)",
                  borderRadius: 16,
                  boxShadow: "0 18px 50px rgba(15,23,42,0.12)",
                  padding: "10px 14px"
                }}
                labelStyle={{ color: "#64748b", marginBottom: 4, fontSize: 12 }}
                itemStyle={{ color: "#0f172a", fontSize: 13, fontWeight: 500 }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
              />
              <Bar dataKey="value" radius={[12, 12, 0, 0]} isAnimationActive={false}>
                {data.map((entry) => (
                  <Cell key={entry.month} fill="#0f172a" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
