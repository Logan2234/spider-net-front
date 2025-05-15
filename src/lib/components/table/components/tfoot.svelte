<script lang="ts">
  import TableLoading from './tableLoading.svelte';

  let {
    loadingRender = 'Loading...',
    infiniteScroll = false,
    page = $bindable(1),
    pageSize = $bindable(10),
    lengthLoadedData = 0,
    count = 0,
    columnLength = 0
  }: {
    loadingRender: (() => string) | string;
    infiniteScroll: boolean;
    page: number;
    pageSize: number;
    lengthLoadedData: number;
    count: number;
    columnLength: number;
  } = $props();

  let isLoading = $state(false);

  const totalPages = $derived(Math.ceil(count / lengthLoadedData));
</script>

<tfoot>
  {#if !infiniteScroll && count > 0}
    <tr>
      <td colspan={columnLength}>
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
    {#if lengthLoadedData && lengthLoadedData === count}
      <tr>
        <td class="py-4 text-center italic opacity-75" colspan={columnLength}>
          No more elements to load
        </td>
      </tr>
    {:else if isLoading}
      <TableLoading {loadingRender} nbCols={columnLength} />
    {/if}
  {/if}
</tfoot>
