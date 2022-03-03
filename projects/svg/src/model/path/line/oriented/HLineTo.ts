import {LineTo} from "../LineTo";
import {Point} from "../../../Point";

export class HLineTo extends LineTo {
  public override get command(): string {
    return "H " + this._point.x;
  }

  public override get position(): Point {
    return super.position;
  }
  public override set position(position: Point) {
    this._point.y = position.y;
  }
}
