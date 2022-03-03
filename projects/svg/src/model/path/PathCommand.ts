import {Point} from "../Point";

export abstract class PathCommand {
  protected _point: Point

  public constructor(point: Point) {
    this._point = point;
  }

  public get position(): Point {
    return this._point
  }
  public set position(position: Point) {
    this._point = {
      x: position.x,
      y: position.y
    }
  }

  public abstract get command(): string;

  public abstract get copy(): PathCommand;
}
