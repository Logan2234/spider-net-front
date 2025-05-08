<script lang="ts">
  const {
    noDataRender = 'No result',
    nbCols
  }: { noDataRender: (() => string) | string; nbCols: number } = $props();
</script>

<tr>
  <td colspan={nbCols}>
    {#if noDataRender instanceof Function}
      {noDataRender()}
    {:else}
      <div class="pt-4 text-center italic">
        {noDataRender}
      </div>
    {/if}
  </td>
</tr>
