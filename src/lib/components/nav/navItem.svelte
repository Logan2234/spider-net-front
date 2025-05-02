<script lang="ts">
    const {
        title = '',
        href = '',
        icon = ''
    }: { title: string; href: string; icon?: string } = $props();
</script>

<a {href} class="flex items-center gap-4 rounded-xl px-4 py-3 duration-150 hover:bg-gray-600/30">
    {#if icon}
        <i class={`fa-solid ${icon} opacity-40`}></i>
    {/if}
    <span class="text-sm">{title}</span>
</a>
