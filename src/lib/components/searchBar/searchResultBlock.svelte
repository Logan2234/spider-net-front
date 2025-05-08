<script lang="ts">
  const {
    results = [],
    loading = false,
    error = ''
  }: { results?: { name: string }[]; loading?: boolean; error?: any } = $props();
</script>

<div
  class="absolute left-[30%] w-2/5 overflow-auto rounded-2xl bg-gray-500/30">
  {#each results as website}
    <div class="flex justify-between">
      <a
        href={`/graph?domain=${website.name}`}
        class="min-w-0 flex-1 py-2 pl-10 break-words duration-150 hover:bg-gray-600/30">
        {website.name}
      </a>
      <a
        aria-label="Open website in new tab"
        href={`https://${website.name}`}
        target="_blank"
        class="p-2 duration-150 hover:bg-gray-600/30">
        <i class="fa-solid fa-arrow-up-right-from-square opacity-40"></i>
      </a>
    </div>
  {:else}
    {#if !loading}
      <p class="m-2 text-center {error ? 'text-red-500 text-sm' : 'text-xs italic'}">
        {error || 'No result'}
      </p>
    {/if}
  {/each}
</div>
