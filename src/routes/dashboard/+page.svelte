<script lang="ts">
    import Button from '$lib/components/base/button.svelte';
    import Card from '$lib/components/base/card.svelte';
    import type { StatsOverview } from '$lib/dtos/statsOverview';
    import { createWebSocket } from '$lib/stores/websocket';
    import { toHumanReadableMemory } from '$lib/utils/humanReadable';
    import { onMount } from 'svelte';

    const cardStyle = 'text-4xl py-4';

    let error: string = $state('');

    let stats: StatsOverview = $state({
        totalDomains: 0,
        totalInQueue: 0,
        totalLinks: 0,
        totalVisited: 0,
        totalErrors: 0,
        memoryUsage: 0,
        crawlingOngoing: false
    });

    onMount(() => {
        const { subscribe } = createWebSocket<StatsOverview>(
            'wss://localhost:4000',
            true,
            'dashboard'
        );

        subscribe((data: StatsOverview[]) => {
            if (data.length === 0) return;
            stats = data[0];
        });
    });

    const startCrawling = async () => {
        const data = await fetch('https://localhost:4000/api/v1/crawl/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!data.ok) {
            const json = await data.json();
            error = json.message;
        }
    };

    const stopCrawling = async () => {
        const data = await fetch('https://localhost:4000/api/v1/crawl/stop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!data.ok) {
            const json = await data.json();
            error = json.message;
        }
    };
</script>

{#if stats}
    <div class="m-24 flex flex-row flex-wrap gap-8">
        <Card
            class="min-w-3xs flex-1/4 sm:flex-1/6"
            title="Domains"
            subtitle="Number of known domains"
            onclick={() => {}}>
            <div class={cardStyle}>{stats.totalDomains}</div>
        </Card>

        <Card
            class="min-w-3xs flex-1/4 sm:flex-1/6"
            title="Queue"
            subtitle="Number of urls in queue"
            onclick={() => {}}>
            <div class={cardStyle}>{stats.totalInQueue}</div>
        </Card>

        <Card
            class="min-w-3xs flex-1/4 sm:flex-1/6"
            title="Visited"
            subtitle="Number of visited urls"
            onclick={() => {}}>
            <div class={cardStyle}>{stats.totalVisited}</div>
        </Card>

        <Card
            class="min-w-3xs flex-1/4 sm:flex-1/6"
            title="Links"
            subtitle="Number of links found"
            onclick={() => {}}>
            <div class={cardStyle}>{stats.totalLinks}</div>
        </Card>

        <Card
            class="min-w-3xs flex-1/4 sm:flex-1/6"
            title="Errored"
            subtitle="Number of errored links"
            onclick={() => {}}>
            <div class={cardStyle}>{stats.totalErrors}</div>
        </Card>
    </div>
{:else}
    <p>Loading...</p>
{/if}

{#if error}
    <p class="text-red-500">{error}</p>
{/if}

<hr class="mt-4 w-3/4 border-gray-400/20" />

<div class="mx-18 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold">Memory usage</h1>
        {#each Object.entries(stats.memoryUsage) as memoryEntry}
            <p>{memoryEntry[0]}: {toHumanReadableMemory(memoryEntry[1])}</p>
        {/each}
    </div>

    <div class="flex flex-col justify-center gap-4 px-8">
        <Button
            label="Start crawling"
            onclick={startCrawling}
            type="button"
            color="simple"
            disabled={stats.totalInQueue === 0 || stats.crawlingOngoing} />
        <Button
            label="Stop crawling"
            onclick={stopCrawling}
            type="reset"
            color="simple"
            disabled={!stats.crawlingOngoing} />
    </div>
</div>
