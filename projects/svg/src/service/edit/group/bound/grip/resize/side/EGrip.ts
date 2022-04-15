import {Grip} from "../Grip";
import {Point} from "../../../../../../../model/Point";
import {Callback} from "../../../../../../../dataSource/constant/Callback";
import {Compass} from "../../../../../../../dataSource/constant/Compass";

export class EGrip extends Grip {
  public setPosition(points: Point[]): void {
    let x = (points[2].x + points[1].x) / 2;
    let y = (points[2].y + points[1].y) / 2;
    this.drag({
      x: x - this.halfSide,
      y: y - this.halfSide
    });
  }

  public override makeMouseDown(client: Point, call: boolean = true): void {
    super.makeMouseDown(client, call);

    if (call) {
      this._container.call(Callback.RESIZE_MOUSE_DOWN, {position: client, compass: Compass.E, elements: this.focus.children});
    }
  }
  public override makeMouseMove(client: Point, call: boolean = true): void {
    super.makeMouseMove(client, call);
    let elementRect = this.focus.lastRect;

    this._lastResize = {
      x: elementRect.x,
      y: elementRect.y,
      width: (client.x) - (elementRect.x),
      height: elementRect.height
    };
    this.focus.setRect(this._lastResize);

    if (call) {
      this._container.call(Callback.RESIZE_MOUSE_MOVE, {position: client, compass: Compass.E});
    }
  }
  public override makeMouseUp(client: Point, call: boolean = true): void {
    super.makeMouseUp(client, call);

    if (call) {
      this._container.call(Callback.RESIZE_MOUSE_UP, {position: client, compass: Compass.E});
    }
  }
}
