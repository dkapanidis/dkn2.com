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
import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Progress } from "@/components/ui/progress"
import { HappyFace, NeutralFace, SadFace, SmilingFace } from "../ui/rating"

type Show = {
    title: string
    url: string
    rating: number
}

const getMonthKey = (date: Date): string => {
    return date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    })
}

const getWeekKey = (date: Date): string => {
    const week = Math.ceil(date.getDate() / 7)
    return `${date.toLocaleString("en-US", { month: "short", year: "numeric" })} W${week}`
}

const getDayKey = (date: Date): string => {
    return date.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

// Fetch and process the data

// Fetch and process the data
const fetchTraktData = async (): Promise<Show[]> => {
    const response = await fetch("https://raw.githubusercontent.com/dkapanidis/life-stats/main/data/trakt/summary.json")
    const data: Show[] = await response.json()

    return data
}

export function Shows() {
    const [traktData, setTraktData] = useState<Show[]>([])

    useEffect(() => {
        fetchTraktData().then(data => setTraktData(data.sort((a, b) => { 
            if (b.rating == undefined) {
                return -100;
            }
            return b.rating - a.rating
         })))
    }, [])

    return (
        <Card>
            <CardHeader className="w-96">
                <CardTitle>Watching Shows</CardTitle>
            </CardHeader>
            <CardContent>
                {traktData.filter((s) => s.url != undefined).map((show, index) =>
                    <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center bg-gray-100 rounded-sm pr-2">
                            <img
                                src={show.url}
                                alt={show.title}
                                className="w-20 h-10 rounded-s-sm object-cover object-center"
                            />
                            <div className="flex flex-col">
                                <div className="flex items-center h-9">
                                    <div className="ml-2 flex-auto w-52">
                                        <p className="text-xs font-medium text-gray-600">{show.title}</p>
                                    </div>

                                    <div className="flex items-center w-8">
                                        {show.rating <= 5 && <SadFace />}
                                        {show.rating > 5 && show.rating <= 7 && <NeutralFace />}
                                        {show.rating > 7 && show.rating <= 9 && <SmilingFace />}
                                        {show.rating == 10 && <HappyFace />}
                                    </div>
                                </div>
                                {/* <Progress
                                    value={0.4 * 100}
                                    style={{ backgroundColor: "transparent" }} // Customize background color here
                                    className="h-px rounded-none w-32 text-green-800"
                                >
                                </Progress> */}
                            </div>
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    )
}

export default Shows
