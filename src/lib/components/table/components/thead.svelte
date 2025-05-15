<script lang="ts">
  import type { IColumn } from '$lib/types/table';
  import { slide, type SlideParams } from 'svelte/transition';

  let {
    cols = [],
    columns = $bindable([]),
    sortBy = $bindable(''),
    sortDir = $bindable(0),
    stickFirstColumn = false,
    callOnLoad
  }: {
    cols: IColumn[];
    columns: IColumn[];
    sortBy: string;
    sortDir: 0 | 1 | -1;
    stickFirstColumn: boolean;
    callOnLoad: (keepPreviousData: boolean) => Promise<void>;
  } = $props();

  // Resize feature
  let resizeColIndex: number | null = $state(null);
  let startX: number | null = $state(null);
  let startWidth: number | null = $state(null);

  const toggleColAnim: SlideParams = { axis: 'x', duration: 200 };

  const handleAutoResize = (index: number) => {
    columns[index].minWidth = cols[index].minWidth;
    columns[index].maxWidth = cols[index].maxWidth;
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (resizeColIndex !== null && startX !== null && startWidth !== null) {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(startWidth + deltaX, 100); // Minimum width of 100px
      columns[resizeColIndex].minWidth = `${newWidth}px`;
      columns[resizeColIndex].maxWidth = `${newWidth}px`;
    }
  };

  const handleResizeStart = (e: MouseEvent, index: number) => {
    resizeColIndex = index;
    startX = e.clientX;
    startWidth = parseInt(columns[index].minWidth || columns[index].maxWidth || '0', 10);
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeEnd = () => {
    resizeColIndex = null;
    startX = null;
    startWidth = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  const handleOnSort = async (name: string) => {
    if (name === sortBy) {
      sortDir = sortDir === 1 ? -1 : sortDir === -1 ? 0 : 1;
    } else {
      sortDir = 1;
    }

    sortBy = name;
    await callOnLoad(false);
  };
</script>

<thead>
  <tr class="relative">
    {#each columns as col, index}
      {#if !col.hidden}
        <th
          transition:slide={toggleColAnim}
          class="bg-main-color relative px-5 py-2 text-nowrap"
          style={`min-width: ${col.minWidth}; max-width: ${col.maxWidth}; ${stickFirstColumn && index === 0 ? 'position: sticky; left: 0' : ''}`}>
          <div transition:slide={toggleColAnim}>
            {#if col.sortable}
              <button
                class="group cursor-pointer text-nowrap"
                onclick={() => handleOnSort(col.name)}
                aria-label="Sort button">
                {col.label}
                <i
                  class="fa-solid fa-arrow-up ml-1 align-super text-[0.5rem] duration-150 group-hover:translate-y-[-1px] {sortBy ===
                    col.name && sortDir === -1
                    ? 'opacity-0'
                    : ''}"
                  aria-label="Sort column"></i>
                <i
                  class="fa-solid fa-arrow-down -ml-2 text-[0.5rem] duration-150 group-hover:translate-y-[1px] {sortBy ===
                    col.name && sortDir === 1
                    ? 'opacity-0'
                    : ''}"
                  aria-label="Sort column"></i>
              </button>
            {:else}
              {col.label}
            {/if}
            {#if col.resizable}
              <button
                aria-label="Resize {col.name} button"
                onmousedown={(e) => handleResizeStart(e, index)}
                ondblclick={() => handleAutoResize(index)}
                class="absolute top-0 right-0 h-full w-1.5 cursor-ew-resize duration-150 hover:backdrop-brightness-110"
              ></button>
            {/if}
          </div>
        </th>
      {/if}
    {/each}
  </tr>
</thead>
