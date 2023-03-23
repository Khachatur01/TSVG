import {PathCommand} from '../../../PathCommand';
import {Point} from '../../../../Point';

export class QBezier extends PathCommand {
  private _cPoint: Point;

  public constructor(cPoint: Point, point: Point, close: boolean = false, absolute: boolean = false) {
    super(point, close, absolute);
    this._cPoint = cPoint;
  }

  public toString(): string {
    return (this.absolute ? 'q ' : 'Q ') +
      this._cPoint.x + ' ' + this._cPoint.y + ', ' +
      this._point.x + ' ' + this._point.y + (this.close ? ' Z' : '');
  }

  public get cPoint(): Point {
    return this._cPoint;
  }
  public set cPoint(point: Point) {
    this._cPoint = point;
  }

  public override get position(): Point {
    return super.position;
  }
  public override set position(position: Point) {
    this._point.x = position.x;
    this._point.y = position.y;

    this._cPoint.x = position.x;
    this._cPoint.y = position.y;
  }

  public get copy(): QBezier {
    return new QBezier({
      x: this._cPoint.x,
      y: this._cPoint.y
    }, {
      x: this._point.x,
      y: this._point.y
    });
  }
}
