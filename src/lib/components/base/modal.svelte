<script lang="ts">
  import { allowScroll, blockScroll } from '$lib/utils/htmlDocumentHelper';

  let {
    header = null,
    content = null,
    footer = null,
    showCloseButton = true,
    open = $bindable(false),
    class: modalClass = '',
    onClose
  }: {
    header?: any;
    content?: any;
    footer?: any;
    open: boolean;
    showCloseButton?: boolean;
    class?: string;
    onClose?: (...args: any) => any;
  } = $props();

  let modal: HTMLDialogElement | undefined = $state();
  let show = $state(false);

  const onCloseHandler = () => {
    show = false;
    setTimeout(() => {
      modal?.close();
      allowScroll();
      onClose?.();
    }, 150);
  };

  const onKeyPressHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      open = false;
    }
  };

  const onOpen = () => {
    blockScroll();
    modal?.showModal();
    setTimeout(() => (show = true), 10);
  };

  $effect(() => {
    if (open) {
      onOpen();
    } else if (show) {
      onCloseHandler();
    }
  });
</script>

<dialog
  bind:this={modal}
  onclose={onCloseHandler}
  onkeydown={onKeyPressHandler}
  class="{show && open
    ? 'translate-y-0 opacity-100'
    : 'translate-y-[10vh] opacity-0'} bg-main-color text-font-primary flex-col gap-8 self-center justify-self-center rounded-xl px-12 py-8 duration-150 backdrop:backdrop-blur-xs backdrop:backdrop-brightness-50 open:flex sm:min-h-1/3 sm:max-w-3/5 sm:min-w-1/3 {modalClass}">
  {#if showCloseButton}
    <button
      type="button"
      aria-label="Close modal"
      onclick={() => (open = false)}
      class="hover:text-black-or-white focus:text-black-or-white absolute top-8 right-8 cursor-pointer rounded-full text-lg duration-150 outline-none">
      <i class="fa-solid fa-xmark"></i>
    </button>
  {/if}
  {#if header}
    <div class="text-4xl font-bold">
      {@render header()}
    </div>
  {/if}
  {#if content}
    <div>
      {@render content()}
    </div>
  {/if}
  {#if footer}
    <div class="flex flex-row justify-end">
      {@render footer()}
    </div>
  {/if}
</dialog>
