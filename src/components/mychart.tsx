"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

type Running = {
    start_date: string
    distance: number
}

type MonthSummary = {
    month: string
    distance: number
}

const getMonthKey = (date: Date): string => {
    return date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    })
}

// Fetch and process the data
const fetchStravaData = async (): Promise<MonthSummary[]> => {
    const currentDate = new Date()
    var summary: MonthSummary[] = []
    const response = await fetch("https://raw.githubusercontent.com/dkapanidis/life-stats/main/data/strava/summary.json")
    const data: Running[] = await response.json()

    // collect data for the last 12 months
    for (let i = 11; i >= 0; i--) {
        // calculate monthKey (month + year)
        const monthDate = new Date(currentDate)
        monthDate.setMonth(currentDate.getMonth() - i)
        const monthKey = getMonthKey(monthDate)

        // sum all distances for specified month
        var res = data
            .filter(v => getMonthKey(new Date(v.start_date)) == monthKey)
            .map(f => f.distance)
            .reduce((acc, v) => acc + v, 0)

        summary.push({
            month: monthKey,
            distance: parseFloat((res / 1000).toFixed(1)),
        })
    }

    return summary
}

export function Component() {
    const [chartData, setChartData] = useState<{ month: string; distance: number }[]>([])

    useEffect(() => {
        fetchStravaData().then(data => setChartData(data))
    }, [])

    const chartConfig = {
        distance: {
            label: "Distance",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig

    return (
        <Card className="">
            <CardHeader className="w-96">
                <CardTitle>Running distance</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            interval={0}
                            axisLine={false}
                            fontSize={10}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) => (
                                        <div className="flex min-w-[130px] items-center text-xs text-muted-foreground">
                                            {chartConfig[name as keyof typeof chartConfig]?.label ||
                                                name}
                                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                {value}
                                                <span className="font-normal text-muted-foreground">
                                                    km
                                                </span>
                                            </div>
                                        </div>
                                    )
                                    }
                                />
                            }
                        />
                        <Bar dataKey="distance" fill="var(--color-distance)" radius={4}>
                            <LabelList
                                position="top"
                                formatter={(v: number) => {
                                    if (v == 0) {
                                        return ""
                                    }
                                    else {
                                        return v
                                    }
                                }}
                                fontSize={8}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export default Component