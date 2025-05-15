<script lang="ts">
  import Button from '$lib/components/base/button.svelte';
  import Input from '$lib/components/base/input.svelte';
  import notifications from '$lib/stores/notifications';
  import type { IColumn } from '$lib/types/table';
  import { scale } from 'svelte/transition';

  let {
    cols = [],
    columns = $bindable([]),
    withGlobalSearch = false,
    tableName = '',
    search = $bindable('')
  }: {
    cols: IColumn[];
    columns: IColumn[];
    withGlobalSearch: boolean;
    tableName: string;
    search: string;
  } = $props();

  // Resize feature
  let resizeColIndex: number | null = $state(null);
  let startX: number | null = $state(null);
  let startWidth: number | null = $state(null);

  // Settings
  let showSettingsPopover = $state(false);
  let dragColIndex: number | null = $state(null);

  const handleResizeMove = (e: MouseEvent) => {
    if (resizeColIndex !== null && startX !== null && startWidth !== null) {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(startWidth + deltaX, 100); // Minimum width of 100px
      columns[resizeColIndex].minWidth = `${newWidth}px`;
      columns[resizeColIndex].maxWidth = `${newWidth}px`;
    }
  };

  const handleResizeEnd = () => {
    resizeColIndex = null;
    startX = null;
    startWidth = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
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

  const reset = () => {
    columns = cols.sort((a, b) => (a.command ? 1 : b.command ? -1 : 0));
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
          {#if !col.command}
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
          {/if}
        {/each}
        {#if tableName}
          <div class="mt-2 flex justify-around">
            <Button
              type="button"
              label="Reset"
              color="secondary"
              size="small"
              class="basis-2/5 grayscale-100"
              onclick={reset} />
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
