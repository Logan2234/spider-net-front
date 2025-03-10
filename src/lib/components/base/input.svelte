<script lang="ts">
    let {
        placeholder = '',
        type = 'text',
        label = '',
        value = $bindable(),
        focused = $bindable(),
        disabled = false,
        required = false,
        style = ''
    }: {
        placeholder?: string;
        type?: string;
        label?: string;
        value?: string;
        focused?: boolean;
        disabled?: boolean;
        required?: boolean;
        style?: string;
    } = $props();

    const randomId = Math.random().toString(36).slice(2);
</script>

<div class="flex flex-col gap-2 {disabled ? 'opacity-50' : ''}">
    {#if label}
        <label for={randomId} class="block"
            >{label}
            <span class="text-sm text-red-500">{required ? '*' : ''}</span></label>
    {/if}
    <input
        id={randomId}
        bind:value
        {placeholder}
        {type}
        {disabled}
        {required}
        onfocus={() => (focused = true)}
        onblur={() => (focused = false)}
        class="not-focus:hover:border-black-or-white bg-dark-gray/20 placeholder-dark-gray focus:outline-black-or-white rounded-md border border-gray-300 px-3 py-2 duration-150 invalid:border-red-500 focus:border-transparent focus:outline-1 focus:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 {style}" />
</div>
