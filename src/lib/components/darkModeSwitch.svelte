<script lang="ts">
    import COOKIE_KEYS from '$lib/constants/cookieKeys';
    import { darkModeOn } from '$lib/stores/theme';
    import Switch from './base/switch.svelte';

    const { class: className = '' } = $props();

    $effect(() => {
        document.documentElement.classList.toggle('dark', $darkModeOn);
        document.cookie = `${COOKIE_KEYS.theme}=${$darkModeOn ? 'dark' : 'light'}; Path=/; SameSite=Strict; Secure; Expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    });
</script>

<Switch bind:value={$darkModeOn} class={className} />
