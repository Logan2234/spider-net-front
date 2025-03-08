<script lang="ts">
    import DarkModeSwitch from '$lib/components/darkModeSwitch.svelte';
    import '../app.css';

    let { children, data } = $props();
</script>

<header class="relative flex w-full justify-end p-5">
    <DarkModeSwitch darkModeOn={data.darkModeOn} />
</header>

{@render children()}
