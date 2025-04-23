import { GRAPH_AMORTIZATION_FACTOR, GRAPH_K_CONSTANT, GRAPH_SAFE_ZONE } from '$lib/constants/graph';
import { Vector2D, type DrawableElement } from '$lib/types/drawableElement';
import { Link } from './link';
import { Node } from './node';

export class Graph implements DrawableElement {
    private hoveredNode: Node | null = null;
    private lastMousePos: Vector2D | null = null;
    private clickedPos: Vector2D | null = null;
    private nodes: Node[] = [];
    private links: Link[] = [];

    constructor(
        private ctx: CanvasRenderingContext2D,
        private mainNode: Node,
        private onMouseMove?: (event: MouseEvent, hoveredNode: Node | null) => void,
        private onNodeClick?: (node: Node) => void
    ) {
        this.ctx.canvas.onmousemove = (e: MouseEvent) => {
            if (this.clickedPos && this.lastMousePos) {
                const delta = new Vector2D(
                    e.offsetX - this.lastMousePos.x,
                    e.offsetY - this.lastMousePos.y
                );

                this.translate(delta.x, delta.y);
            }

            this.lastMousePos = new Vector2D(e.offsetX, e.offsetY);

            const hoveredNode =
                this.nodes.find((node) => {
                    return this.lastMousePos!.getDistance(node.coord) < node.radius;
                }) || null;

            if (hoveredNode) {
                if (this.hoveredNode) {
                    this.hoveredNode.fill = false;
                }

                this.hoveredNode = hoveredNode;
                this.hoveredNode.fill = true;
            } else if (this.hoveredNode) {
                this.hoveredNode.fill = false;
                this.hoveredNode = null;
            }

            this.onMouseMove?.(e, this.hoveredNode);
        };

        this.ctx.canvas.onmousedown = (e: MouseEvent) => {
            if (e.button === 0) {
                this.clickedPos = new Vector2D(e.offsetX, e.offsetY);
            }
        };

        this.ctx.canvas.onmouseup = (e: MouseEvent) => {
            if (
                this.hoveredNode &&
                e.offsetX === this.clickedPos?.x &&
                e.offsetY === this.clickedPos?.y
            ) {
                this.onNodeClick?.(this.hoveredNode);
            }

            this.clickedPos = null;
        };
    }

    destroy(): void {
        this.ctx.canvas.onmousemove = null;
        this.ctx.canvas.onmousedown = null;
        this.ctx.canvas.onmouseup = null;
    }

    addNode(
        weight: number = 1,
        color: string = 'black',
        label: string = '',
        fill: boolean = false
    ): void {
        const x = this.randomPosition(this.ctx.canvas.width);
        const y = this.randomPosition(this.ctx.canvas.height);

        const coord = new Vector2D(x, y);

        const newNode = new Node(coord, weight, color || this.randomColor(), fill, label);
        this.nodes.push(newNode);

        this.addLink(new Link(this.mainNode, newNode));
    }

    addLink(link: Link): void {
        this.links.push(link);
    }

    moveNodes(): void {
        this.nodes.forEach((node) => {
            const accelerationFromCenter = this.moveFromCenterNode(node);
            const accelerationFromOtherNodes = this.moveFromOtherNodes(node);
            node.acceleration = Vector2D.add(
                accelerationFromCenter.multiply(1),
                accelerationFromOtherNodes.multiply(1.5)
            );
            node.move();
        });
    }

    draw(): void {
        this.clearCanvas();
        this.mainNode.draw(this.ctx);
        this.links.forEach((link) => link.draw(this.ctx));
        this.nodes.forEach((node) => {
            node.draw(this.ctx);
        });
    }

    clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    private moveFromCenterNode(node: Node) {
        const distance = node.coord.getDistance(this.mainNode.coord);
        const repos =
            (node.radius + 10) ** 1.4 + node.noise + GRAPH_SAFE_ZONE * 2 + this.mainNode.radius;
        const delta = distance - repos;
        const force = -GRAPH_K_CONSTANT * delta;

        const direction = new Vector2D(
            (node.coord.x - this.mainNode.coord.x) / distance,
            (node.coord.y - this.mainNode.coord.y) / distance
        );

        return new Vector2D(
            direction.x * force - GRAPH_AMORTIZATION_FACTOR * node.velocity.x,
            direction.y * force - GRAPH_AMORTIZATION_FACTOR * node.velocity.y
        );
    }

    private moveFromOtherNodes(node: Node) {
        const acceleration: Vector2D = new Vector2D(0, 0);
        this.nodes.forEach((otherNode) => {
            const distance = node.coord.getDistance(otherNode.coord);
            const delta = node.radius + otherNode.radius - distance + GRAPH_SAFE_ZONE / 4;

            if (otherNode === node || delta < 0) {
                return;
            }

            const direction = new Vector2D(
                (node.coord.x - otherNode.coord.x) / distance,
                (node.coord.y - otherNode.coord.y) / distance
            );

            acceleration.add(new Vector2D(direction.x * 0.1 * delta, direction.y * 0.1 * delta));
        });

        return acceleration;
    }

    private translate(x: number, y: number): void {
        this.mainNode.translate(x, y);

        for (const node of this.nodes) {
            node.translate(x, y);
        }
    }

    private randomPosition(max: number): number {
        return Math.random() * (max - 2 * GRAPH_SAFE_ZONE) + GRAPH_SAFE_ZONE;
    }

    private randomColor(): string {
        const letters = '0123456789ABCDEF';
        let color = '#';

        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }

        return color + 'FF';
    }

    toString(): string {
        return `Graph(nodes=${this.nodes}, links=${this.links})`;
    }
}
