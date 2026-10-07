import RecentProjects from "./RecentProjects";
import AnalyticsOverview from "./AnalyticsOverview";

export default function ProjectsAnalyticsSection() {
    return (
        <div className="flex flex-col lg:flex-row gap-6">

            <RecentProjects />

            <AnalyticsOverview />

        </div>
    );
}