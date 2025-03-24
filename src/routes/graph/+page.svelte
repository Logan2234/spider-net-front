<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { Graph } from '$lib/classes/graph';
    import { Node } from '$lib/classes/node';
    import { GRAPH_RENDER_INTERVAL } from '$lib/constants/graph';
    import { Point2D } from '$lib/types/drawableElement';
    import { onMount } from 'svelte';
    import { innerHeight, innerWidth } from 'svelte/reactivity/window';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();

    const pageWidth = $derived(innerWidth.current || 0);
    const pageHeight = $derived(innerHeight.current || 0);

    let clickedPos: Point2D | null = $state(null);

    onMount(() => {
        const domain = page.url.searchParams.get('domain');

        if (!domain) goto('/');

        const canvas = document.getElementById('graph') as HTMLCanvasElement;

        if (canvas) {
            const center = new Point2D(pageWidth / 2, pageHeight / 2);
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

            const mainNode = new Node(
                center,
                10 + 0.1 * data.stats!.visited,
                'black',
                true,
                domain!
            );
            const graph = new Graph(ctx, mainNode);

            data.stats?.links.forEach((link) => {
                graph.addNode(link.weight, 'black', link.from, false);
            });

            setInterval(() => {
                graph.moveNodes();
                graph.draw();
            }, GRAPH_RENDER_INTERVAL);

            canvas.onmousedown = (e: MouseEvent) => {
                clickedPos = new Point2D(e.offsetX, e.offsetY);
                console.log(clickedPos);

                canvas.onmousemove = (e: MouseEvent) => {
                    const delta = new Point2D(e.offsetX - clickedPos!.x, e.offsetY - clickedPos!.y);
                    clickedPos = new Point2D(e.offsetX, e.offsetY);
                    console.log(delta);
                    graph.translate(delta.x, delta.y);
                };
            };

            canvas.onmouseup = () => {
                clickedPos = null;

                canvas.onmousemove = null;
            };
        }
    });
</script>

<svelte:head>
    <title>Graph</title>
</svelte:head>

<canvas id="graph" class="absolute top-0 bg-gray-800" width={pageWidth} height={pageHeight}
></canvas>

<style lang="postcss">
    :global(body) {
        @apply overflow-hidden;
    }
</style>
