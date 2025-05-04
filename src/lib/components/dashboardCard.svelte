<script lang="ts">
  import { formatNumber } from '$lib/utils/humanReadable';
  import Card from './base/card.svelte';

  const {
    title = '',
    subtitle = '',
    onclick = () => {},
    value = 0,
    previous = 0,
    nbOfStats,
    isRunning = false
  }: {
    title: string;
    subtitle: string;
    onclick?: () => void;
    value: number;
    previous?: number;
    nbOfStats?: number;
    isRunning?: boolean;
  } = $props();

  let first = $state(0);
  let minSpeed: number | null = $state(null);
  let maxSpeed: number | null = $state(null);

  $effect(() => {
    if (!first) {
      first = value;
    }
  });

  const meanSpeed = $derived(
    isRunning && nbOfStats && nbOfStats > 0
      ? Math.round(((value - first) / nbOfStats) * 100) / 100
      : 0
  );
  const previousMeanSpeed = $derived(
    isRunning && nbOfStats && nbOfStats > 1
      ? Math.round(((previous - first) / (nbOfStats - 1)) * 100) / 100
      : 0
  );

  $effect(() => {
    minSpeed = Math.min(minSpeed || 0, meanSpeed);
    maxSpeed = Math.max(maxSpeed || 0, meanSpeed);
  });
</script>

<Card class="min-w-3xs flex-1/4 sm:flex-1/6" {title} {subtitle} {onclick}>
  <div class="py-4 text-4xl font-semibold">{formatNumber(value)}</div>
  {#if isRunning}
    <div class="flex w-full gap-4 text-sm font-semibold opacity-70">
      <span> {maxSpeed ?? '-'}/s</span>
      <span
        class={'flex items-baseline gap-2 ' +
          (meanSpeed - previousMeanSpeed === 0
            ? ''
            : meanSpeed > previousMeanSpeed
              ? 'text-success'
              : 'text-error')}>
        {meanSpeed}/s
        <i
          class="fa-solid text-xs {meanSpeed - previousMeanSpeed === 0
            ? ''
            : meanSpeed > previousMeanSpeed
              ? 'fa-arrow-up'
              : 'fa-arrow-down'}"></i>
      </span>
      <span>{minSpeed ?? '-'}/s</span>
    </div>
  {/if}
</Card>
