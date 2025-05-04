<script lang="ts">
  import notifications, { type Notification } from '$lib/stores/notifications';
  import { onMount } from 'svelte';

  const { notification }: { notification: Notification } = $props();

  onMount(() => {
    const timeout = setTimeout(() => {
      notifications.close(notification.id);
    }, notification.timeout);

    return () => {
      clearTimeout(timeout);
    };
  });

  const color: string = {
    error: 'text-error',
    info: 'text-blue-500',
    success: 'text-success',
    warning: 'text-warning'
  }[notification.type];

  const icon: string = {
    error: 'fa-circle-xmark',
    info: 'fa-circle-info',
    success: 'fa-circle-check',
    warning: 'fa-triangle-exclamation'
  }[notification.type];

  const border: string = {
    error: 'border-error',
    info: 'border-blue-500',
    success: 'border-success',
    warning: 'border-warning'
  }[notification.type];
</script>

<div class={`relative rounded-lg border-2 bg-gray-200 p-4 shadow-md dark:bg-gray-600 ${border}`}>
  <button
    type="button"
    aria-label="Close notification"
    onclick={() => notifications.close(notification.id)}
    class="hover:text-black-or-white focus:text-black-or-white text-md absolute top-4 right-5 cursor-pointer rounded-full opacity-80 duration-150 outline-none">
    <i class="fa-solid fa-xmark"></i>
  </button>
  <div class="flex items-baseline gap-2">
    <i class={`fa-solid ${icon} ${color}`}></i>
    <p class={color + ' brightness-125'}>{notification.title}</p>
  </div>
  <p class="mt-2 pl-6">{notification.message}</p>
</div>
