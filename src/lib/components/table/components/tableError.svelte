<script lang="ts">
  const { nbCols, error }: { nbCols: number; error: string } = $props();
</script>

<tr>
  <td colspan={nbCols} class="pt-4 text-center text-sm text-red-500 italic">
    {error || 'Error loading data'}
  </td>
</tr>
