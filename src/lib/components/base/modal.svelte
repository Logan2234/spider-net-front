<script lang="ts">
    import { allowScroll, blockScroll } from '$lib/utils/htmlDocumentHelper';

    let {
        header = null,
        content = null,
        footer = null,
        showCloseButton = true,
        open = $bindable(false),
        onClose
    }: {
        header: any;
        content: any;
        footer: any;
        open: boolean;
        showCloseButton?: boolean;
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
        : 'translate-y-[10vh] opacity-0'} bg-main-color text-font-primary flex-col gap-8 self-center justify-self-center rounded-xl p-8 duration-150 backdrop:backdrop-blur-xs backdrop:backdrop-brightness-50 open:flex 2xl:max-w-1/2">
    {#if showCloseButton}
        <button
            type="button"
            aria-label="Close modal button"
            onclick={() => (open = false)}
            class="hover:text-black-or-white focus:text-black-or-white absolute top-4 right-4 h-8 w-8 cursor-pointer rounded-full text-2xl outline-none">
            &times;
        </button>
    {/if}
    {#if header}
        {@render header()}
    {/if}
    {#if content}
        {@render content()}
    {/if}
    {#if footer}
        <div class="flex flex-row justify-end">
            {@render footer()}
        </div>
    {/if}
</dialog>
