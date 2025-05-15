<script lang="ts">
  import type { IColumn, IColumnSetting, TableOnLoadFunction } from '$lib/types/table';
  import { onMount } from 'svelte';
  import { slide, type SlideParams } from 'svelte/transition';
  import TableBar from './components/tableBar.svelte';
  import TableError from './components/tableError.svelte';
  import TableLoading from './components/tableLoading.svelte';
  import TableNoData from './components/tableNoData.svelte';
  import Thead from './components/thead.svelte';

  let {
    cols = [],
    selectable = false,
    noDataRender = 'No result',
    loadingRender = 'Loading...',
    repeatHeaderInFooter = false,
    stickyHeader = false,
    stickFirstColumn = false,
    withGlobalSearch = false,
    tableName = '',
    infiniteScroll = false,
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
    tableName?: string;
    infiniteScroll?: boolean;
    onDoubleClick?: (item: any) => void;
    onLoad: TableOnLoadFunction;
  } = $props();

  const initColumns = () => {
    const savedSettings = localStorage.getItem(tableName);
    if (!savedSettings) {
      columns = cols.sort((a, b) => (a.command ? 1 : b.command ? -1 : 0));
      return;
    }

    const savedSettingsParsed: any[] = JSON.parse(savedSettings);

    if (
      savedSettingsParsed.length !== cols.length ||
      !savedSettingsParsed.every((savedCol) => cols.map((col) => col.name).includes(savedCol.name))
    ) {
      columns = cols.sort((a, b) => (a.command ? 1 : b.command ? -1 : 0));
      return;
    }

    columns = savedSettingsParsed.map((colSetting: IColumnSetting) => {
      const findCol = cols.find((col) => col.name === colSetting.name)!;
      return { ...findCol, hidden: colSetting.hidden };
    });
  };

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
  let columns: IColumn[] = $state([]);
  let loadMoreObserverElement: HTMLElement | null = $state(null);

  const toggleColAnim: SlideParams = { axis: 'x', duration: 200 };

  const callOnLoad = async (keepPreviousData: boolean) => {
    isLoading = true;

    try {
      console.log(sortBy, sortDir);
      const loadResults = await onLoad(page, pageSize, { by: sortBy, dir: sortDir }, search, null);
      data =
        infiniteScroll && keepPreviousData ? data.concat(loadResults.results) : loadResults.results;
      count = loadResults.count;
    } catch (err: any) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  };

  onMount(() => {
    callOnLoad(false);
    initColumns();
    mounted = true;
  });

  $effect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          page++;
        }
      },
      { root: null, threshold: 1.0 }
    );

    if (loadMoreObserverElement) {
      observer.observe(loadMoreObserverElement);
    }

    return () => {
      if (loadMoreObserverElement) {
        observer.unobserve(loadMoreObserverElement);
      }
    };
  });

  $effect(() => {
    if (page && pageSize) {
      callOnLoad(page > 1);
    }
  });

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

  const resetTableSettings = () => {
    columns = cols.sort((a, b) => (a.command ? 1 : b.command ? -1 : 0));
  };
</script>

<TableBar {tableName} bind:columns {withGlobalSearch} bind:search {resetTableSettings} />

<table class="block overflow-auto">
  <Thead bind:columns bind:sortBy bind:sortDir {cols} {stickFirstColumn} {callOnLoad} />

  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <tbody
    onmouseup={onMouseUp}
    onmouseleave={onMouseUp}
    class={selectedLines.length > 1 ? 'select-none' : ''}>
    {#if !infiniteScroll && (!mounted || (isLoading && count === 0))}
      <TableLoading {loadingRender} nbCols={columns.length} />
    {:else if error !== null}
      <TableError nbCols={columns.length} {error} />
    {:else if hasNoData}
      <TableNoData {noDataRender} nbCols={columns.length} />
    {:else}
      {#each data as item, itemIndex}
        {#if infiniteScroll && itemIndex === data.length - 3 && data.length && data.length !== count}
          <tr bind:this={loadMoreObserverElement}></tr>
        {/if}
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
            {#if !col.hidden}
              <td
                transition:slide={toggleColAnim}
                class="bg-main-color px-5 py-2 group-hover:bg-[#3e4250] {selectedLines.some(
                  (lineIndex) => lineIndex === itemIndex
                )
                  ? 'bg-[#464b59]!'
                  : ''}"
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
          {/each}
        </tr>
      {/each}
    {/if}
  </tbody>

  <tfoot>
    {#if !infiniteScroll && count > 0}
      <tr>
        <td colspan={columns.length}>
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
              title="Previous page"
              class="not-disabled:cursor-pointer disabled:opacity-50">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
            <button
              onclick={() => page++}
              disabled={page === totalPages}
              aria-label="Next page"
              title="Next page"
              class="not-disabled:cursor-pointer disabled:opacity-50">
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
          <div class="w-full py-4 text-center"></div>
        </td>
      </tr>
    {/if}
    {#if infiniteScroll}
      {#if data.length && data.length === count}
        <tr>
          <td class="py-4 text-center italic opacity-75" colspan={columns.length}>
            No more elements to load
          </td>
        </tr>
      {:else if isLoading}
        <TableLoading {loadingRender} nbCols={columns.length} />
      {/if}
    {/if}
  </tfoot>

  {#if repeatHeaderInFooter}
    <Thead bind:columns bind:sortBy bind:sortDir {cols} {stickFirstColumn} {callOnLoad} />
  {/if}
</table>
