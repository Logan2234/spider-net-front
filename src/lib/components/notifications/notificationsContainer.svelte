<script lang="ts">
  import notifications, {
    type Notification,
    type NotificationPosition
  } from '$lib/stores/notifications';
  import { onMount } from 'svelte';
  import { fly, slide } from 'svelte/transition';
  import NotificationItem from './notificationItem.svelte';

  const { position = 'bottom-right' }: { position?: NotificationPosition } = $props();

  let notificationsList: Notification[] = $state([]);

  onMount(() => {
    const unsubscribe = notifications.subscribe((value) => {
      notificationsList = value;
    });

    return () => {
      unsubscribe();
    };
  });
</script>

<div class="fixed right-8 bottom-4 z-10 flex w-92 flex-col gap-8 transition-all duration-200">
  {#each notificationsList as notification (notification.id)}
    <div in:slide={{ axis: 'y', duration: 300 }} out:fly={{ x: 100, duration: 300, opacity: 0 }}>
      <NotificationItem {notification} />
    </div>
  {/each}
</div>
