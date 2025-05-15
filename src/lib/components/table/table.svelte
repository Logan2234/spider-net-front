<script lang="ts">
  import type { IColumn, IColumnSetting, TableOnLoadFunction } from '$lib/types/table';
  import { onMount } from 'svelte';
  import { slide, type SlideParams } from 'svelte/transition';
  import TableBar from './components/tableBar.svelte';
  import TableError from './components/tableError.svelte';
  import TableLoading from './components/tableLoading.svelte';
  import TableNoData from './components/tableNoData.svelte';
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
