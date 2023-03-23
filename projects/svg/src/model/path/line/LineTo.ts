import {PathCommand} from '../PathCommand';
import {Point} from '../../Point';

export class LineTo extends PathCommand {
  constructor(point: Point, close: boolean = false, absolute: boolean = false) {
    super(point, close, absolute);
  }
  public toString(): string {
    return (this.absolute ? 'l ' : 'L ') +
      this._point.x + ' ' + this._point.y + (this.close ? ' Z' : '');
  }

  public override get position(): Point {
    return super.position;
  }
  public override set position(position: Point) {
    this._point.x = position.x;
    this._point.y = position.y;
  }

  public get copy(): LineTo {
    return new LineTo({
      x: this._point.x,
      y: this._point.y
    });
  }
}
