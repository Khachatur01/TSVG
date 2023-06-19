import {Point} from '../Point';

export abstract class PathCommand {
  protected _point: Point;
  public close: boolean;
  public absolute: boolean;

  protected constructor(point: Point, close: boolean = false, absolute: boolean = false) {
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
  /**
   * @param delta
   * @param point0 zero point against which the calculation should be carried out
   * @param originCommand last fixed value of current path command
   * */
  public drag(delta: Point, point0: Point, originCommand: PathCommand): void {
    this._point = {
      x: point0.x + Math.abs(originCommand.position.x - point0.x) * delta.x,
      y: point0.y + Math.abs(originCommand.position.y - point0.y) * delta.y
    };
  }

  public abstract toString(): string;

  public abstract get copy(): PathCommand;
}
