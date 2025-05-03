import { GRAPH_AMORTIZATION_FACTOR, GRAPH_K_CONSTANT, GRAPH_SAFE_ZONE } from '$lib/constants/graph';
import { Vector2D, type DrawableElement } from '$lib/types/drawableElement';
import { Link } from './link';
import { Node } from './node';

export class Graph implements DrawableElement {
  private hoveredNode: Node | null = null;
  private lastMousePos: Vector2D = new Vector2D(0, 0);
  private clickedPos: Vector2D | null = null;
  private nodes: Node[] = [];
  private links: Link[] = [];

  constructor(
    private ctx: CanvasRenderingContext2D,
    private mainNode: Node,
    private onMouseMove?: (event: MouseEvent, hoveredNode: Node | null) => void,
    private onNodeClick?: (e: MouseEvent, node: Node) => void
  ) {
    this.ctx.canvas.onmousemove = (e: MouseEvent) => {
      const delta = new Vector2D(e.offsetX - this.lastMousePos.x, e.offsetY - this.lastMousePos.y);

      if (e.buttons === 1 && !this.hoveredNode) {
        this.translate(delta.x, delta.y);
      }

      const hoveredNode = this.nodes.find(
        (node) => this.lastMousePos!.getDistance(node.coord) < node.radius
      );

      if (hoveredNode) {
        if (!this.clickedPos) {
          if (this.hoveredNode) {
            this.hoveredNode.hovered = false;
          }

          this.hoveredNode = hoveredNode;
          this.hoveredNode.hovered = true;
        } else if (e.buttons === 1) {
          this.hoveredNode?.translate(delta.x, delta.y);
        }
      } else if (this.hoveredNode) {
        this.hoveredNode.hovered = false;
        this.hoveredNode = null;
      }

      this.onMouseMove?.(e, this.hoveredNode);

      this.lastMousePos = new Vector2D(e.offsetX, e.offsetY);
    };

    this.ctx.canvas.onmousedown = (e: MouseEvent) => {
      this.clickedPos = new Vector2D(e.offsetX, e.offsetY);
    };

    this.ctx.canvas.onmouseup = (e: MouseEvent) => {
      if (
        this.hoveredNode &&
        e.offsetX === this.clickedPos?.x &&
        e.offsetY === this.clickedPos?.y
      ) {
        if (e.ctrlKey) {
          // TODO : Open link in new tab
        } else {
          this.onNodeClick?.(e, this.hoveredNode);
        }
      }

      this.clickedPos = null;
    };

    this.nodes.push(this.mainNode);
  }

  destroy(): void {
    this.ctx.canvas.onmousemove = null;
    this.ctx.canvas.onmousedown = null;
    this.ctx.canvas.onmouseup = null;
  }

  addNode(weight: number = 1, label: string = ''): void {
    const coord = new Vector2D(Math.random(), Math.random()).add(this.mainNode.coord);

    const newNode = new Node(coord, weight, label);
    this.nodes.push(newNode);

    this.addLink(new Link(this.mainNode, newNode));
  }

  addLink(link: Link): void {
    this.links.push(link);
  }

  moveNodes(): void {
    this.nodes.forEach((node) => {
      if (node.hovered && this.clickedPos) return;
      const accelerationFromCenter = this.moveFromCenterNode(node);
      const accelerationFromOtherNodes = this.moveFromOtherNodes(node);
      const newAcceleration = Vector2D.add(
        accelerationFromCenter.multiply(1),
        accelerationFromOtherNodes.multiply(1.25)
      );

      if (Vector2D.add(node.velocity, newAcceleration).magnitude > 0.05) {
        node.acceleration = newAcceleration;
      } else {
        node.acceleration = Vector2D.zero;
        node.velocity.add(node.velocity.multiply(-0.5));
      }

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
    const repos = node.radius ** 1.5 + this.mainNode.radius + GRAPH_SAFE_ZONE * 2 + node.noise;
    const delta = distance - repos;
    const force = -GRAPH_K_CONSTANT * delta * Math.log(Math.sqrt(node.radius));

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
      let delta =
        node.radius + otherNode.radius - distance + Math.sqrt(node.radius * otherNode.radius);
      delta *= 0.1;

      if (otherNode === node || delta < 0) {
        return;
      }

      const direction = new Vector2D(
        (node.coord.x - otherNode.coord.x) / distance,
        (node.coord.y - otherNode.coord.y) / distance
      );

      acceleration.add(new Vector2D(direction.x * delta, direction.y * delta));
    });

    return acceleration;
  }

  private translate(x: number, y: number): void {
    for (const node of this.nodes) {
      node.translate(x, y);
    }
  }

  toString(): string {
    return `Graph(nodes=${this.nodes}, links=${this.links})`;
  }
}
