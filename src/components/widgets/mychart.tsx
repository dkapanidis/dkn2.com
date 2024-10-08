"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { ExternalLinkIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

type Running = {
    start_date: string
    distance: number
}

type TimePeriod = "monthly" | "weekly"

type MonthSummary = {
    period: string
    distance: number
}

const getMonthKey = (date: Date): string => {
    return date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    })
}

const getWeekKey = (date: Date): string => {
    // Adjust date to align week with Monday as the first day of the week
    const day = date.getDay();
    const adjustedDate = new Date(date);
    const dayOfMonth = date.getDate();
    const dayAdjustment = day === 0 ? 6 : day - 1; // Convert Sunday (0) to last day (6), Monday becomes 0
    adjustedDate.setDate(dayOfMonth - dayAdjustment);

    // Now calculate the week number
    const week = Math.ceil(adjustedDate.getDate() / 7);
    
    return `${adjustedDate.toLocaleString("en-US", { month: "short", year: "numeric" })} W${week}`;
};

const getDayKey = (date: Date): string => {
    return date.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

// Fetch and process the data
const fetchStravaData = async (timePeriod: TimePeriod): Promise<MonthSummary[]> => {
    const currentDate = new Date()
    let summary: MonthSummary[] = []
    const response = await fetch("https://raw.githubusercontent.com/dkapanidis/life-stats/main/data/strava/summary.json")
    const data: Running[] = await response.json()

    const getPeriodKey = (date: Date): string => {
        if (timePeriod === "monthly") {
            return getMonthKey(date)
        } else {
            return getWeekKey(date)
        }
    }

    const periods = timePeriod === "monthly" ? 12 : 52;
    // collect data for the specified periods
    for (let i = periods - 1; i >= 0; i--) {
        // calculate the period key (month + year for monthly, week number for weekly, day + month + year for daily)
        const periodDate = new Date(currentDate)
        if (timePeriod === "monthly") {
            periodDate.setDate(1)
            periodDate.setMonth(currentDate.getMonth() - i)
        } else {
            periodDate.setDate(currentDate.getDate() - (i * (timePeriod === "weekly" ? 7 : 1)))
        }
        const periodKey = getPeriodKey(periodDate)

        // sum all distances for specified period
        const res = data
            .filter(v => getPeriodKey(new Date(v.start_date)) === periodKey)
            .map(f => f.distance)
            .reduce((acc, v) => acc + v, 0)

        summary.push({
            period: periodKey,
            distance: parseFloat((res / 1000).toFixed(1)),
        })
    }

    return summary
}

export function Component() {
    const [chartData, setChartData] = useState<{ period: string; distance: number }[]>([])
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("monthly")

    useEffect(() => {
        fetchStravaData(timePeriod).then(data => setChartData(data))
    }, [timePeriod])

    const chartConfig = {
        distance: {
            label: "Distance",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig

    return (
        <Card>
            <CardHeader className="w-96">
                <CardTitle>Running distance</CardTitle>
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => setTimePeriod("monthly")}
                        className={`text-xs px-4 py-2 border rounded ${timePeriod === "monthly" ? "bg-gray-300" : "bg-white"}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setTimePeriod("weekly")}
                        className={`text-xs px-4 py-2 border rounded ${timePeriod === "weekly" ? "bg-gray-300" : "bg-white"}`}
                    >
                        Weekly
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="period"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            fontSize={10}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis
                            dataKey="distance"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => { return `${value} km` }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) => (
                                        <div className="flex min-w-[130px] items-center text-xs text-muted-foreground">
                                            {chartConfig[name as keyof typeof chartConfig]?.label || name}
                                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                {parseFloat((value as number).toFixed(1))}
                                                <span className="font-normal text-muted-foreground">km</span>
                                            </div>
                                        </div>
                                    )}
                                />
                            }
                        />
                        <Bar dataKey="distance" fill="var(--color-distance)" radius={4}>
                        </Bar>
                    </BarChart>
                </ChartContainer>
                <div className="flex pt-4">
                    <a target="_blank" href="https://www.strava.com/athletes/118222457" className="text-xs text-muted-foreground flex items-center gap-1">Strava<ExternalLinkIcon size={10} className="text-xs text-gray-400" /></a>
                    <div className="flex-grow"/>
                </div>
            </CardContent>
        </Card>
    )
}

export default Component
