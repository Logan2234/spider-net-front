<script lang="ts">
  import type { IColumn } from '$lib/types/table';
  import { slide, type SlideParams } from 'svelte/transition';

  const {
    col,
    item,
    colIndex,
    stickFirstColumn,
    isSelected
  }: { col: IColumn; item: any; colIndex: number; stickFirstColumn: boolean; isSelected: boolean } =
    $props();

  const toggleColAnim: SlideParams = { axis: 'x', duration: 200 };
</script>

{#if !col.hidden}
  <td
    aria-colindex={colIndex}
    transition:slide={toggleColAnim}
    role="cell"
    class="bg-main-color px-5 py-2 group-hover:bg-[#3e4250] {isSelected ? 'bg-[#464b59]!' : ''}"
    style={`min-width: ${col.minWidth}; max-width: ${col.maxWidth}; ${stickFirstColumn && colIndex === 0 ? 'position: sticky; left: 0' : ''}`}>
    <div transition:slide={toggleColAnim}>
      {#if col.render}
        {@html col.render(item, colIndex)}
      {:else}
        {item[col.name]}
      {/if}
    </div>
  </td>
{/if}
