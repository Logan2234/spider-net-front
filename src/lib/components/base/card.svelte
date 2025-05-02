<script lang="ts">
    const {
        title = '',
        subtitle = '',
        children,
        class: className = '',
        onclick
    }: {
        title: string;
        subtitle: string;
        children: any;
        class?: string;
        onclick?: () => void;
    } = $props();
</script>

<svelte:element
    this={onclick ? 'button' : 'div'}
    class="rounded-lg px-8 py-6 shadow-md transition duration-200 dark:bg-gray-600 border-2 {onclick &&
        'cursor-pointer text-left hover:-translate-1 hover:shadow-lg'} {className}"
    {onclick}
    role={onclick ? 'button' : undefined}
    tabindex={onclick ? 0 : undefined}>
    <h1 class="text-2xl font-bold">{title}</h1>
    <p class="text-sm">{subtitle}</p>
    {@render children()}
</svelte:element>
