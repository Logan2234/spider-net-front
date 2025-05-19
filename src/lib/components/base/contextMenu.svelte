<script lang="ts">
  import { subscribeScrolling } from '$lib/stores/scroll';
  import type { ContextMenuActions } from '$lib/types/contextMenu';

  let {
    left = '',
    right = '',
    top = '',
    bottom = '',
    isVisible = $bindable(false),
    actions = []
  }: {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
    isVisible: boolean;
    actions: ContextMenuActions;
  } = $props();

  subscribeScrolling((_) => (isVisible = false));
</script>

<svelte:document onclick={() => (isVisible = false)} />

{#if isVisible}
  <div
    class="border-font-primary/40 bg-font-secondary/75 absolute flex flex-col gap-1 rounded-lg border-2 p-2 text-left text-sm whitespace-nowrap"
    style={`left: ${left}; right: ${right}; top: ${top}; bottom: ${bottom};`}>
    {#each actions as { label, icon, class: style, onclick }}
      <button
        class="hover:bg-dark-gray/30 flex cursor-pointer items-baseline gap-2 rounded-lg p-2 duration-150 {style}"
        onclick={(e) => {
          onclick(e);
          isVisible = false;
        }}>
        {#if icon}
          <i class="fa-solid {icon} w-4"></i>
        {/if}
        {label}
      </button>
    {/each}
  </div>
{/if}
