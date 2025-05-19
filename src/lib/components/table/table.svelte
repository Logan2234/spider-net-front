<script lang="ts">
  import type { IColumn, IColumnSetting, TableProps } from '$lib/types/table';
  import { onMount } from 'svelte';
  import TableBar from './components/tableBar.svelte';
  import TableError from './components/tableError.svelte';
  import TableLoading from './components/tableLoading.svelte';
  import TableNoData from './components/tableNoData.svelte';
  import Td from './components/td.svelte';
  import Tfoot from './components/tfoot.svelte';
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
  }: TableProps = $props();

  const getSortedColumnw = () => [...cols].sort((a, b) => (a.command ? 1 : b.command ? -1 : 0));

  const isValidSettings = (saved: any[], cols: IColumn[]): boolean =>
    saved.length === cols.length && saved.every((col) => cols.some((c) => c.name === col.name));

  const initColumns = () => {
    const savedSettings = localStorage.getItem(tableName);
    const sortedCols = getSortedColumnw();

    if (!savedSettings) {
      columns = sortedCols;
      return;
    }

    try {
      const savedSettingsParsed: any[] = JSON.parse(savedSettings);

      if (!isValidSettings(savedSettingsParsed, sortedCols)) {
        columns = sortedCols;
        return;
      }

      columns = savedSettingsParsed.map((colSetting: IColumnSetting) => {
        const findCol = sortedCols.find((col) => col.name === colSetting.name)!;
        return { ...findCol, hidden: colSetting.hidden };
      });
    } catch {
      columns = sortedCols;
    }
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

  const callOnLoad = async (keepPreviousData: boolean) => {
    isLoading = true;

    try {
      const loadResults = await onLoad(page, pageSize, { by: sortBy, dir: sortDir }, search, null);
      data =
        infiniteScroll && keepPreviousData ? data.concat(loadResults.results) : loadResults.results;
      count = loadResults.count;
    } catch (err: any) {
      console.error('Load erorr:', err);
      error = err.message ?? 'An unexpected error occured';
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
      { threshold: 1.0 }
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

  let searchTimeout: NodeJS.Timeout;

  $effect(() => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      page = 1;
    }, 300);
  });

  const hasNoData = $derived(mounted && !isLoading && count === 0);

  const onMouseDown = (e: MouseEvent, index: number) => {
    // TODO clic droit
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
</script>

<TableBar bind:columns bind:search {withGlobalSearch} {tableName} {cols} />

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
      {#each data as item, rowIndex}
        {#if infiniteScroll && rowIndex === data.length - 3 && data.length && data.length !== count}
          <tr bind:this={loadMoreObserverElement}></tr>
        {/if}
        <tr
          aria-rowindex={rowIndex}
          class="group hover:bg-[#3e4250] {selectedLines.includes(rowIndex) ? 'bg-[#464b59]!' : ''}"
          onmousedown={(e) => onMouseDown(e, rowIndex)}
          onmousemove={(e) => onMouseMove(e, rowIndex)}
          ondblclick={() => onDoubleClick && onDoubleClick(item)}>
          {#each columns as col, colIndex}
            <Td
              {col}
              {colIndex}
              {stickFirstColumn}
              {item}
              isSelected={selectedLines.includes(rowIndex)} />
          {/each}
        </tr>
      {/each}
    {/if}
  </tbody>

  <Tfoot
    bind:page
    bind:pageSize
    lengthLoadedData={data.length}
    columnLength={columns.length}
    {count}
    {infiniteScroll}
    {loadingRender} />

  {#if repeatHeaderInFooter}
    <Thead bind:columns bind:sortBy bind:sortDir {cols} {stickFirstColumn} {callOnLoad} />
  {/if}
</table>
