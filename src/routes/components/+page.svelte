<script lang="ts">
    import Button from '$lib/components/base/button.svelte';
    import Input from '$lib/components/base/input.svelte';
    import Modal from '$lib/components/base/modal.svelte';
    import Switch from '$lib/components/base/switch.svelte';
    import Tooltip from '$lib/components/base/tooltip.svelte';

    const divClass = 'p-6 min-h-24 justify-items-center';

    const title = 'text-3xl font-bold p-4 text-center';
    const subtitle = 'text-2xl font-bold p-4 text-center';

    let switchValue = $state(false);
    let target: HTMLElement | undefined = $state();
    let modalOpen = $state(false);
</script>

<div class="flex flex-col items-center justify-center p-2">
    <div class={divClass}>
        <h1 class={title}>Switch</h1>
        <Switch bind:value={switchValue} />
        <div>Value: {switchValue}</div>
    </div>

    <hr class="mt-4 w-3/4 border-gray-400/20" />

    <div class={divClass}>
        <h1 class={title}>Tooltip</h1>
        <Tooltip
            {target}
            message="Ceci est un tooltip mais GIGA GIGA GIGA GIGA GIGA GIGA GIGA GIGA GIGA GIGA GIGA GIGA LONG" />
        <Tooltip
            {target}
            dx={-50}
            dy={100}
            message="Tooltip avec position personnalisée: x: -50, y: 100" />
        <div
            bind:this={target}
            class="flex h-[150px] w-[150px] cursor-help items-center bg-gray-500 p-4 text-center font-bold">
            Survoler pour voir les tooltips
        </div>
    </div>

    <hr class="mt-4 w-3/4 border-gray-400/20" />

    <div class={divClass}>
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

    <hr class="mt-4 w-3/4 border-gray-400/20" />

    <div class={divClass}>
        <h1 class={title}>Modal</h1>
        <Button
            label="Ouvrir la modal"
            color="primary"
            type="button"
            onclick={() => (modalOpen = true)} />
    </div>

    <hr class="mt-4 w-3/4 border-gray-400/20" />

    <div class={divClass}>
        <h1 class={title}>Input</h1>
        <div class="flex flex-col items-center">
            <div>
                <h2 class={subtitle}>Variants</h2>
                <div class="flex flex-row flex-wrap gap-4">
                    <Input label="Normal" />
                    <Input label="Required" required />
                    <Input label="Disabled" disabled />
                    <Input label="With placeholder" placeholder="Placeholder..." />
                    <Input
                        label="With no validation"
                        withValidationIndicators={false}
                        value="test" />
                </div>
            </div>
            <div>
                <h2 class={subtitle}>Types</h2>
                <div class="align-center flex flex-row flex-wrap gap-4">
                    <Input label="Number" placeholder="849" type="number" />
                    <Input label="URL" placeholder="https://google.com" type="url" />
                    <Input label="Email" placeholder="this+is@email.com" type="email" />
                    <Input label="Password" placeholder="P@ssw0rd!" type="password" />
                    <Input label="Range" type="range" />
                    <Input label="Search" placeholder="Placeholder..." type="search" />
                    <Input label="Date" type="date" />
                    <Input label="Datetime Local" type="datetime-local" />
                    <Input label="Time" type="time" />
                    <Input label="Week" type="week" />
                    <Input label="File" type="file" />
                </div>
            </div>
        </div>
    </div>

    <Modal bind:open={modalOpen}>
        {#snippet header()}
            <h1>Modal</h1>
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
