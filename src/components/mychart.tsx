"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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

// Fetch and process the data
const fetchStravaData = async () => {
    const response = await fetch(
      "https://raw.githubusercontent.com/dkapanidis/life-stats/main/strava_data_20240820.json"
    )
    const data = await response.json()
  
    // Create a Date object for the current date
    const currentDate = new Date()
  
    // Create a map to hold the aggregated data for the last 12 months
    const aggregatedData = new Map()
  
    // Initialize the map with the last 12 months and a distance of 0
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentDate)
      monthDate.setMonth(currentDate.getMonth() - i)
      const monthKey = monthDate.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      })
      aggregatedData.set(monthKey, 0)
    }
  
    // Aggregate the distances from the fetched data
    data.forEach((curr: any) => {
      const date = new Date(curr.start_date)
      const month = date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      })
  
      if (aggregatedData.has(month)) {
        aggregatedData.set(month, aggregatedData.get(month) + curr.distance)
      }
    })
  
    // Convert the map to an array and return it
    return Array.from(aggregatedData, ([month, distance]) => ({
      month,
      distance,
    })).reverse()
  }
  
export function Component() {
    const [chartData, setChartData] = useState<{ month: string; distance: number }[]>([])

    console.log(chartData)
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
            <CardHeader>
                <CardTitle>Distance Per Month</CardTitle>
                <CardDescription>Aggregated by month</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />
                        <Bar dataKey="distance" fill="var(--color-distance)" radius={8} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="leading-none text-muted-foreground">
                    Showing total distance for the last months
                </div>
            </CardFooter>
        </Card>
    )
}

export default Component