<script lang="ts">
  let {
    value = $bindable(),
    label = '',
    disabled = false,
    class: style = ''
  }: { value: boolean; label?: string; disabled?: boolean; class?: string } = $props();
</script>

<div>
  <p>{label}</p>
  <label class="relative {style} {disabled ? 'opacity-80' : 'cursor-pointer'}">
    <!-- Hidden Checkbox -->
    <input type="checkbox" bind:checked={value} class="sr-only" {disabled} />

    <!-- Outer Track -->
    <div class="bg-dark-gray h-6 w-14 rounded-full duration-150"></div>

    <!-- Inner Circle (Thumb) -->
    <div
      class="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 {value
        ? 'translate-x-8'
        : 'translate-x-0'}">
    </div>
  </label>
</div>
