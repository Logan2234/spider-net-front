<script lang="ts">
    import type { MouseEventHandler } from 'svelte/elements';
    import Tooltip from './tooltip.svelte';

    let buttonRef: HTMLButtonElement | undefined = $state();

    const {
        onclick,
        type = 'button',
        color = 'primary',
        label,
        disabled = false,
        tooltip = ''
    }: {
        onclick?: MouseEventHandler<HTMLButtonElement>;
        label: string;
        color?: 'primary' | 'secondary' | 'simple';
        type?: 'button' | 'submit' | 'reset';
        disabled?: boolean;
        tooltip?: string;
    } = $props();

    const buttonStyles = {
        primary: 'bg-primary text-font-secondary',
        secondary: 'text-font-primary',
        simple: 'bg-transparent text-font-primary hover:bg-transparent hover:translate-0 hover:underline hover:underline-offset-4 p-0! border-none hover:shadow-none shadow-none active:shadow-none focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4'
    };

    const commonStyle =
        'cursor-pointer px-4 py-2 border-2 border-primary rounded-2xl duration-100 max-w-48';

    const hoverStyle = 'not-disabled:hover:scale-103';

    const focusVisibleStyle =
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

    const disabledStyle = `disabled:opacity-50 disabled:hover:shadow-none disabled:hover:no-underline ${tooltip ? 'disabled:cursor-not-allowed' : 'disabled:cursor-default'}`;
    const activeStyle = 'not-disabled:active:scale-97';
</script>

<Tooltip message={tooltip} target={buttonRef} />
<button
    bind:this={buttonRef}
    class={`${commonStyle} ${hoverStyle} ${focusVisibleStyle} ${disabledStyle} ${activeStyle} ${buttonStyles[color]}`}
    {onclick}
    {type}
    {disabled}>
    {label}
</button>
