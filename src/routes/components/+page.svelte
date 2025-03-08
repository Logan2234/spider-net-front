<script>
    import Button from '$lib/components/base/button.svelte';
    import Switch from '$lib/components/base/switch.svelte';

    const divClass =
        'p-6 flex min-h-24 items-center justify-center gap-4 flex-wrap max-h-60 border-4 border-gray';

    const title = 'text-3xl font-bold border-x-2 px-4 text-center';

    let switchValue = $state(false);
</script>

<div class="flex flex-row flex-wrap items-center justify-center gap-8 p-2">
    <fieldset class={divClass + ' flex-col'}>
        <legend class={title}>Switch</legend>
        <Switch bind:value={switchValue} />
        <div>Value: {switchValue}</div>
    </fieldset>
    <fieldset class={divClass + ' flex-row'}>
        <legend class={title}>Bouton</legend>
        <Button label="Button primaire" color="primary" type="button" />
        <Button label="Button secondaire" color="secondary" type="button" />
        <Button label="Button simple" color="simple" type="button" />
        <Button label="Button primaire désactivé" color="primary" disabled type="button" />
        <Button label="Button secondaire désactivé" color="secondary" disabled type="button" />
        <Button label="Button simple désactivé" color="simple" disabled type="button" />
        <Button
            label="Button primaire désactivé avec tooltip"
            color="primary"
            disabled
            type="button"
            tooltip="Le bouton est désactivé pour des raisons de test" />
    </fieldset>
</div>
