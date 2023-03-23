import {Point} from '../Point';

export abstract class PathCommand {
  protected _point: Point;
  public close: boolean;
  public absolute: boolean;

  public constructor(point: Point, close: boolean = false, absolute: boolean = false) {
    this._point = point;
    this.close = close;
    this.absolute = absolute;
  }

  public get position(): Point {
    return this._point;
  }
  public set position(position: Point) {
    this._point = {
      x: position.x,
      y: position.y
    };
  }

  public abstract toString(): string;

  public abstract get copy(): PathCommand;
}
