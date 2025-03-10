<script lang="ts">
    import Button from '$lib/components/base/button.svelte';
    import Input from '$lib/components/base/input.svelte';
    import Modal from '$lib/components/base/modal.svelte';
    import Switch from '$lib/components/base/switch.svelte';
    import Tooltip from '$lib/components/base/tooltip.svelte';

    const divClass = 'p-6 flex min-h-24 items-center justify-center gap-4 flex-wrap';

    const title = 'text-3xl font-bold px-4 text-center';

    let switchValue = $state(false);
    let target: HTMLElement | undefined = $state();
    let modalOpen = $state(false);
</script>

<div class="flex flex-col items-center justify-center gap-8 p-2">
    <div class={divClass + ' flex-col'}>
        <h1 class={title}>Switch</h1>
        <Switch bind:value={switchValue} />
        <div>Value: {switchValue}</div>
    </div>

    <div class={divClass + ' flex-col'}>
        <h1 class={title}>Tooltip</h1>
        <Tooltip
            {target}
            message="Ceci est un tooltip mais GIGA GIGA GIGA GIGA GIGA GIGA GIGA GIGA GIGA GIGA GIGA GIGA LONG" />
        <Tooltip
            {target}
            x={-50}
            y={100}
            message="Tooltip avec position personnalisée: x: -50, y: 100" />
        <div
            bind:this={target}
            class="flex h-[150px] w-[150px] cursor-help items-center bg-gray-500 p-4 text-center font-bold">
            Survoler pour voir les tooltips
        </div>
    </div>

    <div class={divClass + ' flex-row'}>
        <h1 class={title}>Bouton</h1>
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
    </div>

    <div class={divClass + ' flex-col'}>
        <h1 class={title}>Modal</h1>
        <Button
            label="Ouvrir la modal"
            color="primary"
            type="button"
            onclick={() => (modalOpen = true)} />
    </div>

    <div class={divClass + ' flex-col'}>
        <h1 class={title}>Input</h1>
        <form>
            <Input label="Label" placeholder="Placeholder..." required />
            <Input label="Label" placeholder="Placeholder..." />
            <Input label="URL" placeholder="https://google.com" type="url" required />
            <Input label="Label" placeholder="Placeholder..." disabled />
            <button type="submit">dazd</button>
        </form>
    </div>

    <Modal bind:open={modalOpen}>
        {#snippet header()}
            <h1 class="text-xl font-bold">Modal</h1>
        {/snippet}

        {#snippet content()}
            <div class="flex flex-col items-center justify-center gap-4">
                <p>
                    Ceci est une modal. Vous pouvez fermer la modale en cliquant sur la croix en
                    haut a droite.
                </p>
            </div>
        {/snippet}

        {#snippet footer()}
            <Button
                label="Fermer"
                color="secondary"
                type="button"
                onclick={() => (modalOpen = false)} />
        {/snippet}
    </Modal>
</div>
