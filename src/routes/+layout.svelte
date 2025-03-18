<script lang="ts">
    import DarkModeSwitch from '$lib/components/darkModeSwitch.svelte';
    import MainSearchBar from '$lib/components/searchBar/mainSearchBar.svelte';
    import '../app.css';

    let { children, data } = $props();
</script>

<header class="bg-main-color sticky top-0 z-1 flex items-center justify-center py-2">
    <MainSearchBar />
    <DarkModeSwitch darkModeOn={data.darkModeOn} />
</header>

{@render children()}
