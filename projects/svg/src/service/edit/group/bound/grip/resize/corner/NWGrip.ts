import {Grip} from "../Grip";
import {Point} from "../../../../../../../model/Point";
import {Angle} from "../../../../../../math/Angle";
import {Callback} from "../../../../../../../dataSource/constant/Callback";
import {Compass} from "../../../../../../../dataSource/constant/Compass";

export class NWGrip extends Grip {
  public setPosition(points: Point[]) {
    this.drag({
      x: points[0].x - this.halfSide,
      y: points[0].y - this.halfSide
    });
  }

  public override makeMouseDown(client: Point, call: boolean = true): void {
    super.makeMouseDown(client, call);

    this._lastAngle = 180 - Angle.fromPoints(
      {
        x: this.focus.lastRect.x + this.focus.lastRect.width,
        y: this.focus.lastRect.y + this.focus.lastRect.height
      },
      client,
      {
        x: this.focus.lastRect.x + this.focus.lastRect.width,
        y: this.focus.lastRect.y
      },
    );

    if (call) {
      this._container.call(Callback.RESIZE_MOUSE_DOWN, {position: client, compass: Compass.NW, elements: this.focus.children});
    }
  }
  public override makeMouseMove(client: Point, call: boolean = true): void {
    super.makeMouseMove(client, call);

    let elementRect = this.focus.lastRect;

    if (this._container.perfect) {
      let originPoint: Point = {
        x: elementRect.x + elementRect.width,
        y: elementRect.y + elementRect.height
      };
      let angle = this._lastAngle;
      if (client.x > originPoint.x && client.y > originPoint.y) /* IV */
        angle = 360 - (180 - angle);
      else if (client.x > originPoint.x) /* I */
        angle = 180 - angle;
      else if (client.y > originPoint.y) /* III */
        angle = 180 - (angle - 180);

      client = Angle.lineFromVector(
        originPoint,
        angle,
        Angle.lineLength(originPoint, client)
      );
    }
    let width = (client.x) - (elementRect.x + elementRect.width);
    let height = (client.y) - (elementRect.y + elementRect.height);

    this._lastResize = {
      x: elementRect.x + elementRect.width,
      y: elementRect.y + elementRect.height,
      width: width,
      height: height
    };
    this.focus.setRect(this._lastResize);

    if (call) {
      this._container.call(Callback.RESIZE_MOUSE_MOVE, {position: client, compass: Compass.NW});
    }
  }
  public override makeMouseUp(client: Point, call: boolean = true): void {
    super.makeMouseUp(client, call);

    if (call) {
      this._container.call(Callback.RESIZE_MOUSE_UP, {position: client, compass: Compass.NW});
    }
  }
}
