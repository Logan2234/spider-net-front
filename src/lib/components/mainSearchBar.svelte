<script lang="ts">
    import { allowScroll, blockScroll } from '$lib/utils/htmlDocumentHelper';
    import { fade } from 'svelte/transition';
    import Input from './base/input.svelte';

    let focusedOnUrlInput = $state(false);
    let focusedOnUrlSearch = $state(true);
    let value = $state('a');
    let lastTimeInputModified = $state(0);
    let searchPromise: Promise<any[]> | null = $state(null);

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
        if (!value || Date.now() - lastTimeInputModified < 250) {
            return;
        }

        lastTimeInputModified = Date.now();
        searchPromise = fetch('https://localhost:4000/api/v1/search?searchTerm=' + value, {
            method: 'GET'
        }).then((response) => response.json());
    });

    const onInputKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            focusedOnUrlSearch = false;
            (document.activeElement as HTMLInputElement)?.blur();
        }
    };
</script>

<div
    class="z-1 max-w-1/2 flex-1 duration-200 {focusedOnUrlSearch
        ? 'translate-y-[5vh] scale-150'
        : ''}">
    <Input
        bind:focused={focusedOnUrlInput}
        bind:value
        onkeydown={onInputKeyDown}
        type="text"
        withValidationIndicators={false}
        placeholder="https://www.example.com"
        class="rounded-full! border-0 px-6 py-1 shadow-lg" />
    <div class="absolute w-full">
        {#await searchPromise}
            <div
                class="h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-t-transparent">
            </div>
        {:then response}
            {#if response && value}
                <div class="overflow-auto rounded-2xl bg-gray-500/20">
                    {#each response as website}
                        <div class="flex justify-between">
                            <a
                                href={`https://localhost:5173/search?domain=${website.name}`}
                                class="flex-1 py-2 pl-10 duration-150 hover:bg-gray-600/20">
                                {website.name}
                            </a>
                            <a
                                aria-label="Open website in new tab"
                                href={`https://${website.name}`}
                                target="_blank"
                                class="p-2 duration-150 hover:bg-gray-600/20">
                                <i class="fa-solid fa-arrow-up-right-from-square opacity-40"></i>
                            </a>
                        </div>
                    {/each}
                </div>
            {/if}
        {:catch error}
            <p class="text-white">Error: {error}</p>
        {/await}
    </div>
</div>

{#if focusedOnUrlSearch}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        role="dialog"
        tabindex="-1"
        onclick={() => {
            focusedOnUrlSearch = false;
        }}
        transition:fade={{ duration: 150 }}
        class="fixed top-0 left-0 flex h-full w-full items-center justify-center bg-black/20 backdrop-blur-sm">
    </div>
{/if}
