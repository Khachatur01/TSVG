import {LineTo} from '../LineTo';
import {Point} from '../../../Point';

export class VLineTo extends LineTo {
  constructor(point: Point, close: boolean = false, absolute: boolean = false) {
    super(point, close, absolute);
  }
  public override toString(): string {
    return (this.absolute ? 'v ' : 'V ') +
      this._point.y + (this.close ? ' Z' : '');
  }

  public override get position(): Point {
    return super.position;
  }
  public override set position(position: Point) {
    this._point.y = position.y;
  }
}
