<script lang="ts">
  import type { IColumn, TableOnLoadFunction } from '$lib/types/table';
  import { onMount } from 'svelte';
  import Input from '../base/input.svelte';
  import TableError from './components/tableError.svelte';
  import TableLoading from './components/tableLoading.svelte';
  import TableNoData from './components/tableNoData.svelte';

  let {
    cols = [],
    selectable = false,
    noDataRender = 'No result',
    loadingRender = 'Loading ...',
    repeatHeaderInFooter = false,
    stickyHeader = false,
    stickFirstColumn = false,
    withGlobalSearch = false,
    onDoubleClick,
    onLoad
  }: {
    cols: IColumn[];
    selectable?: boolean;
    noDataRender?: (() => string) | string;
    loadingRender?: (() => string) | string;
    repeatHeaderInFooter?: boolean;
    stickyHeader?: boolean;
    stickFirstColumn?: boolean;
    withGlobalSearch?: boolean;
    onDoubleClick?: (item: any) => void;
    onLoad: TableOnLoadFunction;
  } = $props();

  let mounted = $state(false);
  let error: string | null = $state(null);
  let page = $state(1);
  let pageSize = $state(10);
  let sortDir: 0 | 1 | -1 = $state(0);
  let sortBy = $state('');
  let search = $state('');
  let isLoading = $state(false);
  let count = $state(0);
  let data: any[] = $state([]);
  let selectedLines: number[] = $state([]);
  let isSelecting = $state(false);
  let startSelectedIndex: number | null = $state(null);
  let columns = $state(cols);

  // Resize feature
  let resizeColIndex: number | null = $state(null);
  let startX: number | null = $state(null);
  let startWidth: number | null = $state(null);

  const callOnLoad = async () => {
    isLoading = true;

    try {
      const loadResults = await onLoad(page, pageSize, { by: sortBy, dir: sortDir }, search, null);
      data = loadResults.results;
      count = loadResults.count;
    } catch (err: any) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  };

  onMount(() => {
    callOnLoad();
    mounted = true;
  });

  $effect(() => {
    if (page && pageSize) {
      callOnLoad();
    }
  });

  const handleOnSort = async (name: string) => {
    if (name === sortBy) {
      sortDir = sortDir === 1 ? -1 : sortDir === -1 ? 0 : 1;
    } else {
      sortDir = 1;
    }

    sortBy = name;
    await callOnLoad();
  };

  const totalPages = $derived(Math.ceil(count / data.length));
  const hasNoData = $derived(mounted && !isLoading && count === 0);

  const onMouseDown = (e: MouseEvent, index: number) => {
    if (!selectable || e.button !== 0) return;

    if (selectedLines.indexOf(index) !== -1) {
      if (e.ctrlKey) {
        selectedLines = selectedLines.filter((i) => i !== index);
      } else {
        startSelectedIndex = null;
        selectedLines = [];
      }
      return;
    }

    if (e.ctrlKey) {
      selectedLines.push(index);
    } else if (e.shiftKey && startSelectedIndex) {
      const range = [startSelectedIndex, index].sort((a, b) => a - b);
      selectedLines = Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i);
    } else {
      startSelectedIndex = index;
      isSelecting = true;
      selectedLines = [index];
    }
  };

  const onMouseUp = () => {
    isSelecting = false;
  };

  const onMouseMove = (e: MouseEvent, index: number) => {
    if (isSelecting && startSelectedIndex !== null) {
      const range = [startSelectedIndex, index].sort((a, b) => a - b);
      selectedLines = Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i);
    }
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

  const handleAutoResize = (index: number) => {
    columns[index].minWidth = cols[index].minWidth;
    columns[index].maxWidth = cols[index].maxWidth;
  };
</script>

{#if withGlobalSearch}
  <search>
    <Input
      type="text"
      withValidationIndicators={false}
      placeholder="Search..."
      bind:value={search} />
  </search>
{/if}

<table class="block overflow-auto">
  <thead>
    <tr class="relative">
      {#each columns as col, index}
        <th
          class="bg-main-color relative px-5 py-2 text-nowrap"
          style={`min-width: ${col.minWidth}; max-width: ${col.maxWidth}; ${stickFirstColumn && index === 0 ? 'position: sticky; left: 0' : ''}`}>
          {col.label}
          {#if col.sortable}
            <button
              class="group cursor-pointer text-nowrap"
              onclick={() => handleOnSort(col.name)}
              aria-label="Sort button">
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
          {/if}
          {#if col.resizable}
            <span
              onmousedown={(e) => handleResizeStart(e, index)}
              ondblclick={() => handleAutoResize(index)}
              class="absolute top-0 right-0 h-full w-1.5 cursor-ew-resize hover:backdrop-brightness-110 duration-150"></span>
          {/if}
        </th>
      {/each}
    </tr>
  </thead>

  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <tbody
    onmouseup={onMouseUp}
    onmouseleave={onMouseUp}
    class={selectedLines.length > 1 ? 'select-none' : ''}>
    {#if !mounted || (isLoading && count === 0)}
      <TableLoading {loadingRender} nbCols={columns.length} />
    {:else if error !== null}
      <TableError nbCols={columns.length} {error} />
    {:else if hasNoData}
      <TableNoData {noDataRender} nbCols={columns.length} />
    {:else}
      {#each data as item, itemIndex}
        <tr
          class="group hover:bg-[#3e4250] {selectedLines.some(
            (lineIndex) => lineIndex === itemIndex
          )
            ? 'bg-[#464b59]!'
            : ''}"
          onmousedown={(e) => onMouseDown(e, itemIndex)}
          onmousemove={(e) => onMouseMove(e, itemIndex)}
          ondblclick={() => onDoubleClick && onDoubleClick(item)}>
          {#each columns as col, colIndex}
            <td
              class="bg-main-color px-5 py-2 group-hover:bg-[#3e4250] {selectedLines.some(
                (lineIndex) => lineIndex === itemIndex
              )
                ? 'bg-[#464b59]!'
                : ''}"
              style={`min-width: ${col.minWidth}; max-width: ${col.maxWidth}; ${stickFirstColumn && colIndex === 0 ? 'position: sticky; left: 0' : ''}`}>
              {#if col.render}
                {@html col.render(item, colIndex)}
              {:else}
                {item[col.name]}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    {/if}
  </tbody>

  <tfoot>
    <tr>
      <td colspan={columns.length}>
        {#if count > 0}
          <div class="flex gap-4 justify-self-end pr-4">
            <select bind:value={pageSize}>
              <option class="dark:text-font-secondary" value={5}>5</option>
              <option class="dark:text-font-secondary" value={10}>10</option>
              <option class="dark:text-font-secondary" value={25}>25</option>
              <option class="dark:text-font-secondary" value={50}>50</option>
              <option class="dark:text-font-secondary" value={100}>100</option>
            </select>
            <span>Page {page} of {totalPages}</span>
            <button
              onclick={() => page--}
              disabled={page === 1}
              aria-label="Previous page"
              class="not-disabled:cursor-pointer disabled:opacity-50">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
            <button
              onclick={() => page++}
              disabled={page === totalPages}
              aria-label="Next page"
              class="not-disabled:cursor-pointer disabled:opacity-50">
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        {/if}
      </td>
    </tr>
  </tfoot>

  <!-- TODO: factoriser le code pour cette partie avec un THead -->
  {#if repeatHeaderInFooter}
    <thead>
      <tr>
        {#each cols as col}
          <th
            class="px-5 py-2 text-nowrap"
            style={`min-width: ${col.minWidth}; max-width: ${col.maxWidth}`}>
            {#if col.sortable}
              {col.label}
              <button
                class="group cursor-pointer text-nowrap"
                onclick={() => handleOnSort(col.name)}
                aria-label="Sort button">
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
          </th>
        {/each}
      </tr>
    </thead>
  {/if}
</table>
