<script lang="ts">
    import { allowScroll, blockScroll } from '$lib/utils/htmlDocumentHelper';
    import { fade } from 'svelte/transition';
    import Input from '../base/input.svelte';
    import SearchResultBlock from './searchResultBlock.svelte';
    import { preventDefault } from 'svelte/legacy';

    let focusedOnUrlInput = $state(false);
    let focusedOnUrlSearch = $state(false);
    let value = $state('');
    let oldResponse = $state([]);
    let searchPromise: Promise<any[]> = $state(null!);
    let loading = $state(false);

    $effect(() => {
        if (focusedOnUrlInput && !focusedOnUrlSearch) {
            focusedOnUrlSearch = true;
            blockScroll();
        } else if (!focusedOnUrlSearch) {
            value = '';
            allowScroll();
        }
    });

    $effect(() => {
        value = value.trimStart();

        if (!value) {
            oldResponse = [];
            return;
        }

        loading = true;

        searchPromise = fetch('https://localhost:4000/api/v1/search?searchTerm=' + value, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((response) => {
                oldResponse = response;
                return response || [];
            })
            .finally(() => {
                loading = false;
            });
    });

    const onWindowKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            focusedOnUrlSearch = false;
            (document.activeElement as HTMLInputElement)?.blur();
        }

        if (e.ctrlKey && e.key === 'k') {
            focusedOnUrlInput = true;
            e.preventDefault();
        }
    };
</script>

<svelte:window onkeydown={onWindowKeyDown} />

<div
    class="z-1 max-w-2/5 flex-1 duration-200 {focusedOnUrlSearch
        ? 'translate-y-[5vh] scale-150'
        : ''}">
    <Input
        bind:focused={focusedOnUrlInput}
        bind:value
        type="text"
        withValidationIndicators={false}
        placeholder="https://www.example.com"
        containerClass={`${
            loading
                ? 'after:opacity-60 after:delay-1000 after:animate-[spin_1.5s_linear_infinite_1s] after:fade-in'
                : 'after:opacity-0'
        } after:w-6 after:h-6 after:absolute after:border-r-transparent after:border-3 after:rounded-full after:right-2 after:top-4`}
        class="w-full rounded-full! border-0 px-6 py-1 shadow-lg" />

    {#if value}
        {#await searchPromise}
            <SearchResultBlock {loading} results={oldResponse} />
        {:then response}
            <SearchResultBlock results={response} />
        {:catch error}
            <SearchResultBlock {error} />
        {/await}
    {/if}
</div>

{#if focusedOnUrlSearch}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        role="dialog"
        tabindex="-1"
        onclick={() => (focusedOnUrlSearch = false)}
        transition:fade={{ duration: 150 }}
        class="fixed top-0 left-0 flex h-full w-full items-center justify-center bg-black/30 backdrop-blur-sm">
    </div>
{/if}
