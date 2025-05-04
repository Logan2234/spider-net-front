<script lang="ts">
  import notifications, {
    type Notification,
    type NotificationPosition
  } from '$lib/stores/notifications';
  import { onMount } from 'svelte';
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

<div class="fixed right-8 bottom-4 w-92 z-10 flex flex-col gap-8">
  {#each notificationsList as notification (notification.id)}
    <NotificationItem {notification} />
  {/each}
</div>
