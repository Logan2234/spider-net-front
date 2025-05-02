<script lang="ts">
    import DarkModeSwitch from '../darkModeSwitch.svelte';
    import NavItem from './navItem.svelte';
</script>

<nav class="absolute h-full w-48 space-y-2 p-4">
    <NavItem title="Home" href="/" icon="fa-house" />
    <NavItem title="Dashboard" href="/dashboard" icon="fa-dashboard" />
    <NavItem title="Components" href="/components" icon="fa-flask-vial" />

    <DarkModeSwitch class="!absolute bottom-4" />
</nav>
