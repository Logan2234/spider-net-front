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
    tooltip = '',
    size = 'normal',
    class: style = ''
  }: {
    onclick?: MouseEventHandler<HTMLButtonElement>;
    label: string;
    color?: 'primary' | 'secondary' | 'simple';
    type?: 'button' | 'submit' | 'reset';
    size?: 'small' | 'normal' | 'large';
    disabled?: boolean;
    tooltip?: string;
    class?: string;
  } = $props();

  const buttonStyles = {
    primary: 'bg-primary text-font-secondary',
    secondary: 'text-font-primary',
    simple:
      'bg-transparent text-font-primary hover:bg-transparent hover:translate-0 hover:underline hover:underline-offset-4 p-0! border-none hover:shadow-none shadow-none active:shadow-none focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4'
  };

  const sizeStyle = { small: 'px-2 py-1 border-1', normal: 'px-4 py-2 border-2', large: '' };

  const commonStyle = `cursor-pointer ${sizeStyle[size]} border-primary rounded-2xl duration-100 max-w-48`;

  const hoverStyle = 'not-disabled:hover:scale-103';

  const focusVisibleStyle =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

  const disabledStyle = `disabled:opacity-50 disabled:hover:shadow-none disabled:hover:no-underline ${tooltip ? 'disabled:cursor-not-allowed' : 'disabled:cursor-default'}`;
  const activeStyle = 'not-disabled:active:scale-97';
</script>

<button
  bind:this={buttonRef}
  class={`${commonStyle} ${hoverStyle} ${focusVisibleStyle} ${disabledStyle} ${activeStyle} ${buttonStyles[color]} ${style}`}
  {onclick}
  {type}
  {disabled}>
  {label}
</button>
<Tooltip message={tooltip} target={buttonRef} />
