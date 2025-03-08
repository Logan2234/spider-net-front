<script lang="ts">
    import { scale } from 'svelte/transition';

    let { message = '', target }: { message: string; target?: HTMLElement } = $props();
    let tooltip: HTMLDivElement | undefined = $state();

    if (target) {
        $effect(() => {
            if (tooltip) {
                tooltip.style.left = `${target.offsetLeft - tooltip.offsetWidth - 10}px`;
                tooltip.style.top = `${target.offsetTop - tooltip.offsetHeight + target.offsetTop / 4}px`;
            }
        });
    }
</script>

{#if message}
    <div
        transition:scale|global={{ delay: 25, duration: 100, opacity: 0.5, start: 0.95 }}
        bind:this={tooltip}
        class="absolute z-1 flex max-w-1/4 p-3 text-center text-xs text-gray-200">
        <div class="absolute top-0 left-0 -z-[1] h-full w-full rounded-lg bg-gray-950 opacity-85">
        </div>
        {message}
    </div>
{/if}
