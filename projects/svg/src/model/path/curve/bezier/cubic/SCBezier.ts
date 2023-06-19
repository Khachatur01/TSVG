import {PathCommand} from '../../../PathCommand';
import {Point} from '../../../../Point';

export class SCBezier extends PathCommand {
  private _cPoint0: Point;

  public constructor(cPoint0: Point, point: Point, close: boolean = false, absolute: boolean = false) {
    super(point, close, absolute);
    this._cPoint0 = cPoint0;
  }

  public toString(): string {
    return (this.absolute ? 's ' : 'S ') +
      this._cPoint0.x + ' ' + this._cPoint0.y + ', ' +
      this._point.x + ' ' + this._point.y + (this.close ? ' Z' : '');
  }

  public get cPoint0(): Point {
    return this._cPoint0;
  }
  public set cPoint0(point: Point) {
    this._cPoint0 = point;
  }

  public override get position(): Point {
    return super.position;
  }
  public override set position(position: Point) {
    const delta: Point = {
      x: position.x - this._point.x,
      y: position.y - this._point.y,
    };

    this._point.x = position.x;
    this._point.y = position.y;

    this._cPoint0.x += delta.x;
    this._cPoint0.y += delta.y;
  }

  public override drag(delta: Point, point0: Point, originCommand: SCBezier): void {
    this._point = {
      x: point0.x + Math.abs(originCommand.position.x - point0.x) * delta.x,
      y: point0.y + Math.abs(originCommand.position.y - point0.y) * delta.y
    };
    this._cPoint0 = {
      x: point0.x + Math.abs(originCommand._cPoint0.x - point0.x) * delta.x,
      y: point0.y + Math.abs(originCommand._cPoint0.y - point0.y) * delta.y,
    };
  }

  public get copy(): SCBezier {
    return new SCBezier({
      x: this._cPoint0.x,
      y: this._cPoint0.y
    }, {
      x: this._point.x,
      y: this._point.y
    });
  }
}
