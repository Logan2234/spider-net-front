<script lang="ts">
    import type { InputType } from '$lib/types/inputType';

    let {
        placeholder = '',
        type = 'text',
        label = '',
        value = $bindable(),
        focused = $bindable(),
        disabled = false,
        required = false,
        withValidationIndicators = true,
        class: style = '',
        containerClass = '',
        onkeydown
    }: {
        placeholder?: string;
        type?: InputType;
        label?: string;
        value?: string;
        focused?: boolean;
        disabled?: boolean;
        required?: boolean;
        withValidationIndicators?: boolean;
        class?: string;
        containerClass?: string;
        onkeydown?: (e: KeyboardEvent) => any;
    } = $props();

    $effect(() => {
        if (focused) {
            document.getElementById(randomId)?.focus();
        }
    })

    const randomId = Math.random().toString(36).slice(2);

    const disabledStyle =
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-dark-gray/15';

    const defaultStyle =
        'bg-dark-gray/15 placeholder-dark-gray border-dark-gray rounded-md border px-3 py-2 duration-150';

    const focusStyle =
        'focus:border-transparent! focus:outline-1 focus:outline-offset-2 focus:outline-dark-gray';

    const validStyle = withValidationIndicators
        ? 'valid:not-placeholder-shown:outline-success valid:not-placeholder-shown:border-success'
        : '';

    const invalidStyle = withValidationIndicators
        ? 'invalid:not-placeholder-shown:outline-error invalid:not-placeholder-shown:border-error'
        : '';
</script>

<div class="my-2 flex flex-col {disabled ? 'opacity-50' : ''} {containerClass}">
    {#if label}
        <label
            for={randomId}
            class="w-fit pb-1 {required
                ? "after:ml-0.5 after:text-red-500 after:content-['*']"
                : ''}">
            {label}
        </label>
    {/if}

    <span
        class={withValidationIndicators
            ? `
        has-valid:has-not-placeholder-shown:after:text-success
        has-invalid:has-not-placeholder-shown:after:text-error
        after:absolute after:-z-1 after:-ml-8 after:px-3
        after:py-2
        has-valid:has-not-placeholder-shown:after:content-['✓']
        has-invalid:has-not-placeholder-shown:after:content-['✗']`
            : ''}>
        <input
            {onkeydown}
            id={randomId}
            bind:value
            {placeholder}
            {type}
            {disabled}
            {required}
            onfocus={() => (focused = true)}
            onblur={() => (focused = false)}
            class="peer {defaultStyle} {disabledStyle} {focusStyle} {invalidStyle} {validStyle} hover:bg-dark-gray/20 {style}" />
    </span>
</div>
