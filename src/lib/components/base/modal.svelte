<script lang="ts">
    let firstLoad = $state(true);
    let show = $state(false);

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

    const onCloseHandler = () => {
        console.log('ON CLOSE');
        onClose?.();
        document.documentElement.classList.remove('overflow-hidden');
        document.documentElement.classList.remove('mr-[15px]');
        show = false;
    };

    const onKeyPressHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            open = false;
        }
    };

    $effect(() => {
        if (open) {
            modal?.showModal();
            show = true;
            document.documentElement.classList.add('overflow-hidden');
            document.documentElement.classList.add('mr-[15px]');
        } else if (show) {
            setTimeout(() => {
                modal?.close();
            }, 150);
        }
    });

    let modal: HTMLDialogElement | undefined = $state();
</script>

<dialog
    bind:this={modal}
    onclose={onCloseHandler}
    onkeydown={onKeyPressHandler}
    class="{show && open
        ? 'translate-y-0 opacity-100'
        : 'translate-y-[10vh] opacity-0'} bg-main-color text-font-primary scale-0 flex-col gap-8 self-center justify-self-center rounded-xl p-8 duration-150 backdrop:backdrop-blur-xs backdrop:backdrop-brightness-50 open:flex open:scale-100 2xl:max-w-1/2">
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
