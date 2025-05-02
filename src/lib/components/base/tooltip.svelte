<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { scale } from 'svelte/transition';

  let {
    message = '',
    target,
    class: tooltipClass = '',
    dx = 0,
    dy = 0
  }: { message: string; target?: HTMLElement; class?: string; dx?: number; dy?: number } = $props();

  let showTooltip = $state(false);
  let tooltip: HTMLDivElement | undefined = $state();

  onMount(() => {
    if (!target) {
      showTooltip = true;
    } else {
      target?.addEventListener('mouseenter', () => (showTooltip = true));
      target?.addEventListener('mouseleave', () => (showTooltip = false));
    }
  });

  onDestroy(() => {
    target?.removeEventListener('mouseenter', () => (showTooltip = true));
    target?.removeEventListener('mouseleave', () => (showTooltip = false));
  });

  $effect(() => {
    if (tooltip && target) {
      tooltip.style.top = `${target.offsetTop - tooltip.offsetHeight + target.offsetTop / 8 + dy}px`;
      tooltip.style.left = `${target.offsetLeft - tooltip.offsetWidth - 10 + dx}px`;
    }
  });
</script>

{#if message && showTooltip}
  <div
    transition:scale|global={{ delay: 25, duration: 100, opacity: 0.5, start: 0.95 }}
    bind:this={tooltip}
    class="absolute z-1 flex max-w-1/4 p-3 text-center text-xs text-gray-200 {tooltipClass}">
    <div class="absolute top-0 left-0 -z-[1] h-full w-full rounded-lg bg-gray-950 opacity-85"></div>
    {message}
  </div>
{/if}
