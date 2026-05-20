import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { DbMetric } from '../../types';

interface ConnectionsChartProps {
  data: DbMetric[];
}

export function ConnectionsChart({ data }: ConnectionsChartProps) {
  const chartData = [...data].reverse().map((m) => ({
    time: format(new Date(m.capture_time), 'HH:mm:ss'),
    CPU: parseFloat(String(m.cpu)),
    RAM: parseFloat(String(m.memory)),
    Conexiones: m.connections,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
        <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
        <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f1629', border: '1px solid #1e2d4a', borderRadius: 8 }}
          labelStyle={{ color: '#94a3b8', fontFamily: 'JetBrains Mono', fontSize: 11 }}
          itemStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
        <Line type="monotone" dataKey="CPU"        stroke="#ef4444" strokeWidth={1.5} dot={false} />
        <Line type="monotone" dataKey="RAM"        stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
        <Line type="monotone" dataKey="Conexiones" stroke="#00d4ff" strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
