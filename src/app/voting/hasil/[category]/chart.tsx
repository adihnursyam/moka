import { type ChartConfig } from "@/components/ui/chart"
import { categories } from '@/lib/data'

export const chartConfig = {
  vote: {
    label: "Vote",
    color: "#2563eb",
  },
} satisfies ChartConfig

export const getChartData = (category: 'JR' | 'MR' | 'MD' | 'JD') => {
  return categories.find(cat => cat.abrev === category)?.list.map((finalist, i) => ({
    name: finalist.name,
    vote: i * 100 + Math.floor(Math.random() * 1000), // Simulated votes
  })) || [];
}