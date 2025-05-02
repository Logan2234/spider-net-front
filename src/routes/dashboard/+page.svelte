<script lang="ts">
  import Button from '$lib/components/base/button.svelte';
  import Card from '$lib/components/base/card.svelte';
  import type { StatsOverview } from '$lib/dtos/statsOverview';
  import { createWebSocket } from '$lib/stores/websocket';
  import { toHumanReadableMemory } from '$lib/utils/humanReadable';
  import { onMount } from 'svelte';

  let error: string = $state('');

  let stats: StatsOverview = $state({
    totalDomains: 0,
    totalInQueue: 0,
    totalLinks: 0,
    totalVisited: 0,
    totalErrors: 0,
    memoryUsage: 0,
    nbWorkers: 0
  });

  let firstStatsReceived: StatsOverview = $state({
    totalDomains: 0,
    totalInQueue: 0,
    totalLinks: 0,
    totalVisited: 0,
    totalErrors: 0,
    memoryUsage: 0,
    nbWorkers: 0
  });
  let nbOfReceivedStats: number = $state(0);

  onMount(() => {
    const { subscribe } = createWebSocket<StatsOverview>('wss://localhost:4000', true, 'dashboard');

    subscribe((data: StatsOverview[]) => {
      if (data.length === 0) return;

      if (data[0].nbWorkers) {
        if (firstStatsReceived.nbWorkers === 0) {
          firstStatsReceived = data[0];
        }

        nbOfReceivedStats += 1;
      }

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

<div class="m-24 flex flex-row flex-wrap gap-8">
  <Card
    class="min-w-3xs flex-1/4 sm:flex-1/6"
    title="Domains"
    subtitle="Number of known domains"
    onclick={() => {}}>
    <div class="py-4 text-4xl">{stats.totalDomains}</div>
    {#if stats.nbWorkers}
      <div class="text-sm opacity-50">
        {Math.round(
          ((stats.totalDomains - firstStatsReceived.totalDomains) / nbOfReceivedStats / 2) * 100
        ) / 100}/s
      </div>
    {/if}
  </Card>

  <Card
    class="min-w-3xs flex-1/4 sm:flex-1/6"
    title="Queue"
    subtitle="Number of urls in queue"
    onclick={() => {}}>
    <div class="py-4 text-4xl">{stats.totalInQueue}</div>
    {#if stats.nbWorkers}
      <div class="text-sm opacity-50">
        {Math.round(
          ((stats.totalInQueue - firstStatsReceived.totalInQueue) / nbOfReceivedStats / 2) * 100
        ) / 100}/s
      </div>
    {/if}
  </Card>

  <Card
    class="min-w-3xs flex-1/4 sm:flex-1/6"
    title="Visited"
    subtitle="Number of visited urls"
    onclick={() => {}}>
    <div class="py-4 text-4xl">{stats.totalVisited}</div>
    {#if stats.nbWorkers}
      <div class="text-sm opacity-50">
        {Math.round(
          ((stats.totalVisited - firstStatsReceived.totalVisited) / nbOfReceivedStats / 2) * 100
        ) / 100}/s
      </div>
    {/if}
  </Card>

  <Card
    class="min-w-3xs flex-1/4 sm:flex-1/6"
    title="Links"
    subtitle="Number of links found"
    onclick={() => {}}>
    <div class="py-4 text-4xl">{stats.totalLinks}</div>
    {#if stats.nbWorkers}
      <div class="text-sm opacity-50">
        {Math.round(
          ((stats.totalLinks - firstStatsReceived.totalLinks) / nbOfReceivedStats / 2) * 100
        ) / 100}/s
      </div>
    {/if}
  </Card>

  <Card
    class="min-w-3xs flex-1/4 sm:flex-1/6"
    title="Errored"
    subtitle="Number of errored links"
    onclick={() => {}}>
    <div class="py-4 text-4xl">{stats.totalErrors}</div>
    {#if stats.nbWorkers}
      <div class="text-sm opacity-50">
        {Math.round(
          ((stats.totalErrors - firstStatsReceived.totalErrors) / nbOfReceivedStats / 2) * 100
        ) / 100}/s
      </div>
    {/if}
  </Card>
</div>

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
      disabled={stats.totalInQueue === 0 || !!stats.nbWorkers} />
    <Button
      label="Stop crawling"
      onclick={stopCrawling}
      type="reset"
      color="simple"
      disabled={!stats.nbWorkers} />
  </div>
</div>
