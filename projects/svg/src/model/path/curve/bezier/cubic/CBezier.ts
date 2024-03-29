import {PathCommand} from '../../../PathCommand';
import {Point} from '../../../../Point';

export class CBezier extends PathCommand {
  private _cPoint0: Point;
  private _cPoint1: Point;

  public constructor(cPoint0: Point, cPoint1: Point, point: Point, close: boolean = false, absolute: boolean = false) {
    super(point, close, absolute);
    this._cPoint0 = cPoint0;
    this._cPoint1 = cPoint1;
  }

  public toString(): string {
    return (this.absolute ? 'c ' : 'C ') +
      this._cPoint0.x + ' ' + this._cPoint0.y + ', ' +
      this._cPoint1.x + ' ' + this._cPoint1.y + ', ' +
      this._point.x + ' ' + this._point.y + (this.close ? ' Z' : '');
  }

  public get cPoint0(): Point {
    return this._cPoint0;
  }
  public set cPoint0(point: Point) {
    this._cPoint0 = point;
  }

  public get cPoint1(): Point {
    return this._cPoint1;
  }
  public set cPoint1(point: Point) {
    this._cPoint1 = point;
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
    this._cPoint1.x += delta.x;
    this._cPoint1.y += delta.y;
  }

  public override drag(delta: Point, point0: Point, originCommand: CBezier): void {
    this._point = {
      x: point0.x + Math.abs(originCommand.position.x - point0.x) * delta.x,
      y: point0.y + Math.abs(originCommand.position.y - point0.y) * delta.y
    };
    this._cPoint0 = {
      x: point0.x + Math.abs(originCommand._cPoint0.x - point0.x) * delta.x,
      y: point0.y + Math.abs(originCommand._cPoint0.y - point0.y) * delta.y,
    };
    this._cPoint1 = {
      x: point0.x + Math.abs(originCommand._cPoint1.x - point0.x) * delta.x,
      y: point0.y + Math.abs(originCommand._cPoint1.y - point0.y) * delta.y,
    };
  }

  public get copy(): CBezier {
    return new CBezier({
      x: this._cPoint0.x,
      y: this._cPoint0.y
    }, {
      x: this._cPoint1.x,
      y: this._cPoint1.y
    }, {
      x: this._point.x,
      y: this._point.y
    });
  }
}
