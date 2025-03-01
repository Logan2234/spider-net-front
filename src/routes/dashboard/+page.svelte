<script lang="ts">
    import Card from '$lib/components/card.svelte';
    import type { StatsOverview } from '$lib/dtos/statsOverview';
    import { createWebSocket } from '$lib/stores/websocket';
    import { onMount } from 'svelte';

    const cardStyle = 'p-6 text-center text-2xl max-w-xl';

    let url: string = $state('');
    let error: string = $state('');

    let stats: StatsOverview = $state({
        totalDomains: 0,
        totalInQueue: 0,
        totalLinks: 0,
        totalVisited: 0
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

    const addInQueue = async () => {
        const data = await fetch('https://localhost:4000/api/v1/queue/', {
            method: 'POST',
            body: JSON.stringify({ url, priority: 0 }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!data.ok) {
            const json = await data.json();
            error = json.message;
        }
    };

    const startCrawling = async () => {
        const data = await fetch('https://localhost:4000/api/v1/crawl/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!data.ok) {
            const json = await data.json();
            error = json.message;
        } else {
            const json = await data.json();
            alert('Action successful: ' + json.success);
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
        } else {
            const json = await data.json();
            alert('Action successful: ' + json.success);
        }
    };
</script>

<input type="url" bind:value={url} placeholder="Enter the URL to scrap" />
<br />
<button onclick={addInQueue}>Add URL in queue</button>

{#if error}
    <p class="text-red-500">{error}</p>
{/if}

{#if stats}
    <div class="flex flex-row gap-4">
        <Card title="Domains" subtitle="Number of known domains">
            <div class={cardStyle}>{stats.totalDomains}</div>
        </Card>

        <Card title="Queue" subtitle="Number of urls in queue">
            <div class={cardStyle}>{stats.totalInQueue}</div>
        </Card>

        <Card title="Visited" subtitle="Number of visited urls">
            <div class={cardStyle}>{stats.totalVisited}</div>
        </Card>

        <Card title="Links" subtitle="Number of links found">
            <div class={cardStyle}>{stats.totalLinks}</div>
        </Card>
    </div>

    <button onclick={startCrawling} disabled={stats.totalInQueue === 0}>Start crawling</button>
    <button onclick={stopCrawling}>Stop crawling</button>
{:else}
    <p>Loading...</p>
{/if}
