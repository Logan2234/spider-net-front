<script lang="ts">
    import DarkModeSwitch from '$lib/components/darkModeSwitch.svelte';
    import MainSearchBar from '$lib/components/mainSearchBar.svelte';
    import '../app.css';

    let { children, data } = $props();
</script>

<header class="bg-main-color sticky top-0 z-1 flex items-center justify-center px-5 py-2">
    <MainSearchBar />
    <div class="absolute right-4">
        <DarkModeSwitch darkModeOn={data.darkModeOn} />
    </div>
</header>

{@render children()}
