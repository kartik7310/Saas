"use client";
import { div } from 'framer-motion/client'
import React from 'react'
import StatsSection from './_components/StatsSection'
import ProjectsAnalyticsSection from './_components/ProjectsAnalyticsSection'
import NewLeads from './_components/NewLeads'
import UpcomingMeetings from './_components/UpcomingMeetings'
import { useAuth } from '@/lib/AuthContext'

const page = () => {
    const { user } = useAuth()
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Welcome, {user?.name || 'User'}!
                </h1>

                <p className="text-gray-500 mt-1">
                    Here's an overview of your real estate projects.
                </p>
            </div>
            {/* Stats Section */}
            <StatsSection />
            {/* Projects Analytics Section */}
            <ProjectsAnalyticsSection />
            {/* Leads and Meetings Section */}
            <div className="flex flex-col lg:flex-row gap-6 mt-6">

                <NewLeads />

                <UpcomingMeetings />

            </div>
        </div>

    )
}

export default page