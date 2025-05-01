export interface StatsOverview {
    totalDomains: number;
    totalInQueue: number;
    totalLinks: number;
    totalVisited: number;
    totalErrors: number;
    memoryUsage: number;
    crawlingOngoing: boolean;
}
