<script lang="ts">
    import { dev } from '$app/environment';
    import { page } from '$app/state';
</script>

<svelte:head>
    <title>Error: {page.status}</title>
</svelte:head>

<div class="flex flex-col items-center justify-center gap-4 p-36">
    <h1 class="text-9xl font-extrabold">{page.status}</h1>
    <p class="text-4xl font-medium">{page.error?.message}</p>
</div>

{#if dev}
    <div class="absolute bottom-0 max-h-52 min-h-1/5 w-full overflow-auto border-t-2 pl-2">
        <span class="sticky top-0 right-0 float-right rounded-bl-md bg-[#00000055] px-4 py-2"
            >Dev only</span>
        <pre>{JSON.stringify(page.error, null, 2)}</pre>
    </div>
{/if}
