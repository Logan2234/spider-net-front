<script lang="ts">
    import Card from '$lib/components/card.svelte';

    const cardStyle = 'p-6 text-center text-2xl max-w-xl';

    let url: string = $state('');
    let error: string = $state('');
    let numberInQueue: number = $state(0);
    let numberOfDomains: number = $state(0);
    let numberOfLinks: number = $state(0);
    let numberOfVisitedSites: number = $state(0);

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

    const load = async () => {
        try {
            const data = await fetch('https://localhost:4000/api/v1/stats', { method: 'GET' });

            if (data.ok) {
                const res = await data.json();
                numberInQueue = res?.numberInQueue || 0;
                numberOfDomains = res?.numberOfDomains || 0;
                numberOfLinks = res?.numberOfLinks || 0;
                numberOfVisitedSites = res?.numberOfVisitedSites || 0;
            }
        } catch (err: any) {
            error = err.message;
        }
    };

    setInterval(load, 1000);
</script>

<input type="url" bind:value={url} placeholder="Enter the URL to scrap" />
<br />
<button onclick={addInQueue}>Add URL in queue</button>

{#if error}
    <p class="text-red-500">{error}</p>
{/if}

{#await load()}
    ...
{:then _}
    <div class="flex flex-row gap-4">
        <Card title="Domains" subtitle="Number of known domains">
            <div class={cardStyle}>{numberOfDomains}</div>
        </Card>

        <Card title="Queue" subtitle="Number of urls in queue">
            <div class={cardStyle}>{numberInQueue}</div>
        </Card>

        <Card title="Visited" subtitle="Number of visited urls">
            <div class={cardStyle}>{numberOfVisitedSites}</div>
        </Card>

        <Card title="Links" subtitle="Number of links found">
            <div class={cardStyle}>{numberOfLinks}</div>
        </Card>
    </div>
{/await}

<button onclick={startCrawling} disabled={numberInQueue === 0}>Start crawling</button>
<button onclick={stopCrawling}>Stop crawling</button>
