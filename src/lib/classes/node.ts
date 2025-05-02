import { GRAPH_TRANSITION_SPEED } from '$lib/constants/graph';
import { Vector2D, type DrawableElement } from '$lib/types/drawableElement';

export class Node implements DrawableElement {
  private _noise: number;

  private currentOpacity: number = 0;
  private targetOpacity: number = 0;

  public acceleration: Vector2D = new Vector2D();
  public velocity: Vector2D = new Vector2D();
  public coord: Vector2D = new Vector2D();

  public radius: number = 1;
  public label: string = '';
  public hovered: boolean = false;

  constructor(coord: Vector2D = new Vector2D(), weight: number = 1, label: string = '') {
    this.coord = coord;
    this.radius = 2 + Math.sqrt(weight);
    this.label = label;
    this._noise = ((Math.random() - 0.5) * 100) / this.radius;
  }

  public get noise(): number {
    return this._noise;
  }

  public move(): void {
    this.coord.add(this.velocity.add(this.acceleration));
  }

  public translate(x: number, y: number): void {
    this.coord.x += x;
    this.coord.y += y;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.coord.x, this.coord.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();

    this.targetOpacity = this.hovered ? 1 : 0;

    this.currentOpacity += (this.targetOpacity - this.currentOpacity) * GRAPH_TRANSITION_SPEED;

    ctx.fillStyle = `rgba(0, 0, 0, ${this.currentOpacity})`;
    ctx.fill();
    ctx.fillStyle = 'black';
  }

  public toString(): string {
    return `(${this.coord.x}, ${this.coord.y})`;
  }
}
