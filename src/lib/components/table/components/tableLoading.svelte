<script lang="ts">
  const {
    loadingRender = 'Loading ...',
    nbCols
  }: { loadingRender: (() => string) | string; nbCols: number } = $props();
</script>

<tr>
  <td colspan={nbCols}>
    {#if loadingRender instanceof Function}
      {loadingRender()}
    {:else}
      <div class="pt-4 text-center italic">
        {loadingRender}
      </div>
    {/if}
  </td>
</tr>
