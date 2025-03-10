<script lang="ts">
    import Input from '$lib/components/base/input.svelte';
    import DarkModeSwitch from '$lib/components/darkModeSwitch.svelte';
    import '../app.css';

    let { children, data } = $props();

    let focusedOnUrlInput = $state(false);
    let value = $state('');

    $effect(() => {
        if (focusedOnUrlInput) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
            value = '';
        }
    });
</script>

<header class="bg-main-color sticky top-0 z-2 flex items-center justify-center px-5 py-2">
    <form onsubmit={() => console.log(value)} class="max-w-1/2 flex-1">
        <Input
            bind:focused={focusedOnUrlInput}
            bind:value
            type="text"
            withValidationIndicators={false}
            placeholder="https://www.example.com"
            style="focus:translate-y-[20vh] focus:scale-150 shadow-lg duration-200 rounded-full! px-6 py-1 text-sm border-0" />
    </form>

    <div class="absolute right-4">
        <DarkModeSwitch darkModeOn={data.darkModeOn} />
    </div>
</header>

{#if focusedOnUrlInput}
    <div class="fixed top-0 z-1 h-full w-full backdrop-blur-sm"></div>
{/if}

{@render children()}
