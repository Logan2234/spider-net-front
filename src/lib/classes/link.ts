import { GRAPH_TRANSITION_SPEED } from '$lib/constants/graph';
import type { DrawableElement } from '$lib/types/drawableElement';
import type { Node } from './node';

export class Link implements DrawableElement {
  private currentOpacity: number = 0.2;
  private targetOpacity: number = 0.2;

  constructor(
    public from: Node,
    public to: Node
  ) {}

  draw(ctx: CanvasRenderingContext2D): void {
    this.targetOpacity = this.to.hovered ? 1 : 0.2;

    this.currentOpacity += (this.targetOpacity - this.currentOpacity) * GRAPH_TRANSITION_SPEED;

    const angle = this.from.coord.getAngle(this.to.coord);

    ctx.strokeStyle = `rgba(0, 0, 0, ${this.currentOpacity})`;
    ctx.beginPath();

    ctx.moveTo(
      this.from.coord.x + Math.cos(angle) * this.from.radius,
      this.from.coord.y + Math.sin(angle) * this.from.radius
    );

    ctx.lineTo(
      this.to.coord.x - Math.cos(angle) * this.to.radius,
      this.to.coord.y - Math.sin(angle) * this.to.radius
    );

    ctx.stroke();
    ctx.strokeStyle = 'black';
  }

  toString(): string {
    return `(${this.from.coord.x}, ${this.from.coord.y}) -> (${this.to.coord.x}, ${this.to.coord.y})`;
  }
}
