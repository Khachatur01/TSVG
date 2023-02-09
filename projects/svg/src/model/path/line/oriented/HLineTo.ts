import {LineTo} from '../LineTo';
import {Point} from '../../../Point';

export class HLineTo extends LineTo {
  public override toString(): string {
    return 'H ' + this._point.x + (this.close ? ' Z' : '');
  }

  public override get position(): Point {
    return super.position;
  }
  public override set position(position: Point) {
    this._point.y = position.y;
  }
}
