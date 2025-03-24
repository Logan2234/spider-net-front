import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
    const domain = url.searchParams.get('domain');

    if (!domain) {
        return {};
    }

    const data = await fetch('https://localhost:4000/api/v1/stats?domain=' + domain, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    if (data.ok) {
        const stats: { visited: number; queue: number; links: { from: string; weight: number }[] } =
            await data.json();
        return { stats };
    }
};
