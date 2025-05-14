<script lang="ts">
  import notifications from '$lib/stores/notifications';
  import type { IColumn, IColumnSetting, TableOnLoadFunction } from '$lib/types/table';
  import { onMount } from 'svelte';
  import { scale, slide, type SlideParams } from 'svelte/transition';
  import Button from '../base/button.svelte';
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
    tableName = '',
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
    onDoubleClick?: (item: any) => void;
    onLoad: TableOnLoadFunction;
  } = $props();

  const initColumns = () => {
    const savedSettings = localStorage.getItem(tableName);
    if (!savedSettings) {
      columns = cols;
      return;
    }

    const savedSettingsParsed: any[] = JSON.parse(savedSettings);

    if (
      savedSettingsParsed.length !== cols.length ||
      !savedSettingsParsed.every((savedCol) => cols.map((col) => col.name).includes(savedCol.name))
    ) {
      columns = cols;
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

  // Resize feature
  let resizeColIndex: number | null = $state(null);
  let startX: number | null = $state(null);
  let startWidth: number | null = $state(null);

  // Settings
  let showSettingsPopover = $state(false);
  let dragColIndex: number | null = $state(null);

  const toggleColAnim: SlideParams = { axis: 'x', duration: 200 };

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
    initColumns();
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

  const handleDrop = (index: number) => {
    if (dragColIndex === null || dragColIndex === index) return;

    const updated = [...columns];
    const [moved] = updated.splice(dragColIndex, 1);
    updated.splice(index, 0, moved);
    columns = updated;
    dragColIndex = null;
  };

  const saveTableSettings = () => {
    localStorage.setItem(
      tableName,
      JSON.stringify(
        columns.map((col: IColumn) => {
          return { name: col.name, hidden: col.hidden };
        }),
        null,
        2
      )
    );

    showSettingsPopover = false;
    notifications.showNotification(
      'Table layout saved! This layout will be loaded when reloading.',
      'success'
    );
  };

  const resetTableSettings = () => {
    columns = cols;
    showSettingsPopover = false;
  };
</script>

<div class="flex items-center gap-2">
  {#if withGlobalSearch}
    <search>
      <Input
        type="text"
        withValidationIndicators={false}
        placeholder="Search..."
        bind:value={search} />
    </search>
  {/if}
  <div>
    <button
      aria-label="Toggle table settings popover"
      class="h-8 w-8 cursor-pointer rounded-full duration-200 hover:rotate-45 active:scale-90"
      onclick={() => (showSettingsPopover = !showSettingsPopover)}>
      <i class="fa-solid fa-cog"></i>
    </button>
    {#if showSettingsPopover}
      <div
        role="menu"
        tabindex="-1"
        transition:scale={{ start: 0.95, duration: 100, opacity: 0 }}
        class="bg-main-color absolute z-1 mt-2 items-center rounded-2xl border-2 p-2 text-center">
        {#each columns as col, index}
          <div
            role="menuitem"
            tabindex="-1"
            class="flex items-center gap-3 px-4 py-1"
            draggable={dragColIndex === index ? true : false}
            ondragover={(e) => e.preventDefault()}
            ondrop={() => handleDrop(index)}>
            <button
              class="cursor-pointer rounded-full not-hover:opacity-75 active:scale-95"
              title="Drag to sort column"
              aria-label="Drag to sort {col.label} column"
              onmouseenter={() => (dragColIndex = index)}
              onmouseleave={() => (dragColIndex = null)}>
              <i class="fa-solid fa-ellipsis-vertical"></i>
              <i class="fa-solid fa-ellipsis-vertical -ml-0.5"></i>
            </button>
            <button
              aria-label={(col.hidden ? 'Show ' : 'Hide ') + col.label + ' column'}
              class="w-5 cursor-pointer rounded-full duration-150 not-hover:opacity-75 active:scale-95"
              title={col.hidden ? 'Show column' : 'Hide column'}
              onclick={() => (col.hidden = !col.hidden)}>
              <i class="fa-regular {col.hidden ? 'fa-eye-slash' : 'fa-eye'}"></i>
            </button>
            {col.label}
          </div>
        {/each}
        {#if tableName}
          <div class="mt-2 flex justify-around">
            <Button
              type="button"
              label="Reset"
              color="secondary"
              size="small"
              class="basis-2/5 grayscale-100"
              onclick={resetTableSettings} />
            <Button
              type="button"
              label="Save"
              color="primary"
              size="small"
              class="basis-2/5 grayscale-100"
              onclick={saveTableSettings} />
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<table class="block overflow-auto">
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
