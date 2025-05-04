<script lang="ts">
  import Button from '$lib/components/base/button.svelte';
  import DashboardCard from '$lib/components/dashboardCard.svelte';
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

  let oldStats: StatsOverview = $state({
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
    const { messages } = createWebSocket<StatsOverview>('wss://localhost:4000', false, 'dashboard');

    const unsubscribe = messages.subscribe((data: StatsOverview[]) => {
      if (data.length < 2) return;

      if (data[1].nbWorkers) {
        nbOfReceivedStats += 1;
      }

      oldStats = data[0];
      stats = data[1];
      messages.set([data[1]]);
    });

    return () => {
      unsubscribe();
    };
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
  <DashboardCard
    title="Domains"
    subtitle="Number of known domains"
    onclick={() => {}}
    value={stats.totalDomains}
    previous={oldStats.totalDomains}
    nbOfStats={nbOfReceivedStats}
    isRunning={!!stats.nbWorkers} />

  <DashboardCard
    title="Queue"
    subtitle="Number of urls in queue"
    onclick={() => {}}
    value={stats.totalInQueue}
    previous={oldStats.totalInQueue}
    isRunning={!!stats.nbWorkers}
    nbOfStats={nbOfReceivedStats} />

  <DashboardCard
    title="Visited"
    subtitle="Number of visited urls"
    onclick={() => {}}
    value={stats.totalVisited}
    previous={oldStats.totalVisited}
    isRunning={!!stats.nbWorkers}
    nbOfStats={nbOfReceivedStats} />

  <DashboardCard
    title="Links"
    subtitle="Number of links found"
    onclick={() => {}}
    value={stats.totalLinks}
    previous={oldStats.totalLinks}
    isRunning={!!stats.nbWorkers}
    nbOfStats={nbOfReceivedStats}>
  </DashboardCard>

  <DashboardCard
    value={stats.totalErrors}
    previous={oldStats.totalErrors}
    isRunning={!!stats.nbWorkers}
    nbOfStats={nbOfReceivedStats}
    onclick={() => {}}
    title="Errored"
    subtitle="Number of errored links" />

  <DashboardCard
    title="Workers"
    subtitle="Number of workers"
    onclick={() => {}}
    value={stats.nbWorkers} />
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
