<script lang="ts">
  import Nav from '$lib/components/nav/nav.svelte';
  import NotificationsContainer from '$lib/components/notifications/notificationsContainer.svelte';
  import MainSearchBar from '$lib/components/searchBar/mainSearchBar.svelte';
  import { scrollingOn } from '$lib/stores/scroll';
  import { darkModeOn } from '$lib/stores/theme';
  import '../app.css';
  let { children, data } = $props();

  darkModeOn.set(data.darkModeOn);
  let showNav = $state(false);
</script>

<header class="sticky top-0 right-0 z-1 flex items-center px-4 py-1">
  <button
    class="border-dark-gray/30 bg-dark-gray/15 hover:bg-dark-gray/20 left-4 w-8 cursor-pointer rounded-lg border-[1px] p-1 duration-150"
    onclick={() => (showNav = !showNav)}
    aria-label="Toggle navigation menu">
    <i class="fa-bars fa-solid"></i>
  </button>
  <MainSearchBar />
</header>

<div class="flex h-[calc(100vh-64px)]">
  <div
    class="duration-300 {showNav ? 'translate-x-0 opacity-100' : '-translate-x-[192px] opacity-0'}">
    <Nav />
  </div>

  <main
    class="flex-1 transition-all duration-300 {showNav ? 'ml-0' : '-ml-48'} overflow-auto"
    onscroll={scrollingOn}>
    {@render children()}
  </main>
</div>

<NotificationsContainer />

<style lang="postcss">
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-button {
    display: none;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(150, 150, 150, 0.3);
    box-shadow: inset 0 0 2px #111111;
  }

  ::-webkit-scrollbar-track {
    border-radius: 10px;
    box-shadow: inset 0 0 2px #111111;
  }

  ::-webkit-scrollbar-corner {
    display: none;
  }
</style>
