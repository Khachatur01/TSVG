import {Grip} from "../Grip";
import {Point} from "../../../../../../../model/Point";
import {Angle} from "../../../../../../math/Angle";
import {Callback} from "../../../../../../../dataSource/constant/Callback";
import {Compass} from "../../../../../../../dataSource/constant/Compass";

export class SEGrip extends Grip {
  public setPosition(points: Point[]): void {
    this.drag({
      x: points[2].x - this.halfSide,
      y: points[2].y - this.halfSide
    });
  }

  public override makeMouseDown(client: Point, call: boolean = true): void {
    super.makeMouseDown(client, call);
    this._lastAngle = Angle.fromPoints(
      this.focus.lastRect,
      client,
      {x: 0, y: client.y}
    );

    if (call) {
      this._container.call(Callback.RESIZE_MOUSE_DOWN, {position: client, compass: Compass.SE, elements: this.focus.children});
    }
  }
  public override makeMouseMove(client: Point, call: boolean = true): void {
    super.makeMouseMove(client, call);
    let position = this.focus.lastRect;

    if (this._container.perfect) {
      let angle = this._lastAngle;
      if (client.x < position.x && client.y < position.y) /* II */
        angle = 180 - (360 - angle);
      else if (client.x < position.x) /* III */
        angle = 180 + (360 - angle);
      else if (client.y < position.y) /* I */
        angle = 360 - angle;

      client = Angle.lineFromVector(
        this.focus.lastRect,
        angle,
        Angle.lineLength(position, client)
      );
    }
    let width = client.x - position.x;
    let height = client.y - position.y;

    this._lastResize = {
      x: position.x,
      y: position.y,
      width: width,
      height: height
    };
    this.focus.setRect(this._lastResize);

    if (call) {
      this._container.call(Callback.RESIZE_MOUSE_MOVE, {position: client, compass: Compass.SE});
    }
  }
  public override makeMouseUp(client: Point, call: boolean = true): void {
    super.makeMouseUp(client, call);

    if (call) {
      this._container.call(Callback.RESIZE_MOUSE_UP, {position: client, compass: Compass.SE});
    }
  }
}
