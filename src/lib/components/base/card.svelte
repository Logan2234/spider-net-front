<script lang="ts">
    const {
        title = '',
        subtitle = '',
        children
    }: { title: string; subtitle: string; children: any } = $props();
</script>

<div class="w-fit rounded-lg bg-gray-400 p-4 shadow-md">
    <h1 class="text-center text-2xl font-bold">{title}</h1>
    <p class="text-center text-sm">{subtitle}</p>
    {@render children()}
</div>
