import {Point} from "../../../../../../../model/Point";
import {Grip} from "../Grip";
import {Callback} from "../../../../../../../dataSource/constant/Callback";
import {Compass} from "../../../../../../../dataSource/constant/Compass";

export class SGrip extends Grip {
  public setPosition(points: Point[]): void {
    let x = (points[3].x + points[2].x) / 2;
    let y = (points[3].y + points[2].y) / 2;
    this.drag({
      x: x - this.halfSide,
      y: y - this.halfSide
    });
  }

  public override makeMouseDown(client: Point, call: boolean = true): void {
    super.makeMouseDown(client, call);

    if (call) {
      this._container.call(Callback.RESIZE_MOUSE_DOWN, {position: client, compass: Compass.S, elements: this.focus.children});
    }
  }
  public override makeMouseMove(client: Point, call: boolean = true): void {
    super.makeMouseMove(client, call);
    let elementRect = this.focus.lastRect;
    let height = client.y - (elementRect.y);

    this._lastResize = {
      x: elementRect.x,
      y: elementRect.y,
      width: elementRect.width,
      height: height
    };
    this.focus.setRect(this._lastResize);

    if (call) {
      this._container.call(Callback.RESIZE_MOUSE_MOVE, {position: client, compass: Compass.S});
    }
  }
  public override makeMouseUp(client: Point, call: boolean = true): void {
    super.makeMouseUp(client, call);

    if (call) {
      this._container.call(Callback.RESIZE_MOUSE_UP, {position: client, compass: Compass.S});
    }
  }
}
