"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { ExternalLinkIcon } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { HappyFace, NeutralFace, SadFace, SmilingFace } from "../ui/rating"

type Show = {
    title: string
    url: string
    rating: number
}

const fetchTraktData = async (): Promise<Show[]> => {
    const response = await fetch("https://raw.githubusercontent.com/dkapanidis/life-stats/main/data/trakt/summary.json")
    const data: Show[] = await response.json()
    return data
}

export function Shows() {
    const [traktData, setTraktData] = useState<Show[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const itemsPerPage = 5

    useEffect(() => {
        fetchTraktData().then(data => setTraktData(data.sort((a, b) => {
            if (b.rating == undefined) {
                return -100
            }
            return b.rating - a.rating
        })))
    }, [])

        // Filter data first, then calculate total pages based on filtered data
        const filteredItems = traktData
        .filter(v => !!v.url) // Filter items with valid URLs
        .filter(v => !!v.rating) // Filter items with valid ratings

    // Calculate the total number of pages
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

    // Get the current items to display based on the page
    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    return (
        <Card className="w-96 h-[400px] flex flex-col justify-between"> {/* Ensure the card stretches vertically */}
            <CardHeader>
                <CardTitle>Watching Shows</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow"> {/* Flex-grow ensures this takes up available space */}
                <div className="flex-grow overflow-y-auto"> {/* This div will grow and scroll if content exceeds */}
                    {currentItems
                        .filter(v => !!v.url)
                        .filter(v => !!v.rating)
                        .map((show, index) =>
                            <div key={index} className="flex items-center justify-between py-2">
                                <div className="flex items-center bg-gray-100 rounded-sm pr-2">
                                    {show.url != undefined && <Image
                                        src={show.url}
                                        alt={show.title}
                                        width={80}
                                        height={40}
                                        className="w-20 h-10 rounded-s-sm object-cover object-center"
                                    /> || <div className="w-20" />}
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
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
                <div className=""> {/* Ensure the buttons stay at the bottom */}
                    <div className="flex justify-between items-center">
                        <a target="_blank" href="https://trakt.tv/users/dkn2" className="text-xs text-muted-foreground flex items-center gap-1">
                            Trakt
                            <ExternalLinkIcon size={10} className="text-xs text-gray-400" />
                        </a>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className={`text-xs text-gray-600 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={`text-xs text-gray-600 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default Shows
