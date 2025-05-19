<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Graph } from '$lib/classes/graph';
  import { Node } from '$lib/classes/node';
  import ContextMenu from '$lib/components/base/contextMenu.svelte';
  import Modal from '$lib/components/base/modal.svelte';
  import Tooltip from '$lib/components/base/tooltip.svelte';
  import { GRAPH_RENDER_INTERVAL } from '$lib/constants/graph';
  import { Vector2D } from '$lib/types/drawableElement';
  import { onMount } from 'svelte';
  import { innerHeight, innerWidth } from 'svelte/reactivity/window';
  import type { PageProps } from './$types';

  const { data }: PageProps = $props();

  let showTooltip = $state('');
  let showContextMenu = $state(false);
  let openContextMenu: { node: Node; pos: Vector2D } | null = $state(null);
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
      new Vector2D(pageWidth / 2, pageHeight / 2),
      10 + 2 * (data.stats?.visited || 0),
      domain
    );

    const graph = new Graph(
      ctx,
      mainNode,
      (_: MouseEvent, hoveredNode: Node | null) => {
        showTooltip = hoveredNode?.label || '';
        ctx.canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
      },
      (e: MouseEvent, node: Node) => {
        e.preventDefault();
        switch (e.button) {
          case 0:
            clickedNode = node;
            break;
          case 1:
            open('https://' + node.label, '_blank');
            break;
          case 2:
            openContextMenu = { node, pos: new Vector2D(e.clientX, e.clientY) };
            showContextMenu = true;
            break;
          default:
            break;
        }
      }
    );

    data.stats?.links.forEach((link, index) => {
      setTimeout(
        () => graph.addNode(link.weight + 1000 / data.stats.links.length, link.from),
        index * 10
      );
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

<Modal open={!!clickedNode} onClose={() => (clickedNode = null)}>
  {#snippet header()}
    <h1>Informations</h1>
    <a
      class="text-dark-gray hover:text-black-or-white/70 mt-2 text-lg duration-150 hover:text-shadow-lg"
      target="_blank"
      href={`https://${clickedNode?.label}`}>{clickedNode?.label}</a>
  {/snippet}
</Modal>

<ContextMenu
  bind:isVisible={showContextMenu}
  left="{openContextMenu?.pos.x ? openContextMenu.pos.x + 10 : 0}px"
  top="{openContextMenu?.pos.y ? openContextMenu.pos.y + 10 : 0}px"
  actions={[
    { label: 'Open stats', icon: 'fa-chart-simple', onclick: () => {} },
    { label: 'Open graph', icon: 'fa-hexagon-nodes', onclick: () => {} },
    { label: 'Open link in new tab', icon: 'fa-arrow-up-right-from-square', onclick: () => {} },
    { label: 'Copy link', icon: 'fa-clipboard', onclick: () => {} }
  ]} />
