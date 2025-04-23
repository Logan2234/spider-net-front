<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { Graph } from '$lib/classes/graph';
    import { Node } from '$lib/classes/node';
    import Modal from '$lib/components/base/modal.svelte';
    import Tooltip from '$lib/components/base/tooltip.svelte';
    import { GRAPH_RENDER_INTERVAL } from '$lib/constants/graph';
    import { Point2D } from '$lib/types/drawableElement';
    import { onMount } from 'svelte';
    import { innerHeight, innerWidth } from 'svelte/reactivity/window';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();

    let showTooltip = $state('');
    let clickedNode: Node | null = $state(null);

    const pageWidth = $derived(innerWidth.current || 0);
    const pageHeight = $derived(innerHeight.current || 0);

    let stopInterval: NodeJS.Timeout | undefined;

    let ctx: CanvasRenderingContext2D;
    onMount(() => {
        const canvas = document.getElementById('graph') as HTMLCanvasElement;
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        canvas.oncontextmenu = (e) => e.preventDefault();
    });

    $effect(() => {
        const domain = page.url.searchParams.get('domain');
        if (!domain) {
            goto('/');
            return;
        }

        clearInterval(stopInterval);
        stopInterval = loadGraph(domain);
    });

    function loadGraph(domain: string) {
        const mainNode = new Node(
            new Point2D(pageWidth / 2, pageHeight / 2),
            10 + 0.1 * (data.stats?.visited || 0),
            'black',
            true,
            domain
        );

        const graph = new Graph(
            ctx,
            mainNode,
            (_: MouseEvent, hoveredNode: Node | null) => {
                showTooltip = hoveredNode?.label || '';
                ctx.canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
            },
            (node: Node) => {
                clickedNode = node;
            }
        );

        data.stats?.links.forEach((link, index) => {
            setTimeout(() => graph.addNode(link.weight, 'black', link.from, false), index * 10);
        });

        return setInterval(() => {
            graph.moveNodes();
            graph.draw();
        }, GRAPH_RENDER_INTERVAL);
    }
</script>

<svelte:head>
    <title>Graph</title>
</svelte:head>

<canvas id="graph" class="absolute top-0" width={pageWidth} height={pageHeight}> </canvas>

<Tooltip message={showTooltip} class="bottom-8 left-1/2 -translate-x-1/2" />

<Modal open={!!clickedNode} onClose={() => (clickedNode = null)} class="">
    {#snippet header()}
        <h1>Informations</h1>
        <h2 class="text-dark-gray mt-2 text-lg">{clickedNode?.label}</h2>
    {/snippet}
</Modal>

<style lang="postcss">
    :global(body) {
        @apply overflow-hidden;
    }
</style>
