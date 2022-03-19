import {Grip} from "../Grip";
import {Point} from "../../../../../../../model/Point";
import {Angle} from "../../../../../../math/Angle";
import {Callback} from "../../../../../../../dataSource/constant/Callback";
import {Compass} from "../../../../../../../dataSource/constant/Compass";

export class SWGrip extends Grip {
  public setPosition(points: Point[]): void {
    this.position = {
      x: points[3].x - this.halfSide,
      y: points[3].y - this.halfSide
    }
  }

  public override makeMouseDown(client: Point, call: boolean = true): void {
    super.makeMouseDown(client, call);
    this._lastAngle = Angle.fromPoints(
      {
        x: this.focus.lastRect.x + this.focus.lastRect.width,
        y: this.focus.lastRect.y
      },
      client,
      {x: 0, y: this.focus.lastRect.y + this.focus.lastRect.height}
    );

    if (call) {
      this._container.call(Callback.RESIZE_START, {position: client, compass: Compass.SW, elements: this.focus.children});
    }
  }
  public override makeMouseMove(client: Point, call: boolean = true): void {
    super.makeMouseMove(client, call);
    let elementRect = this.focus.lastRect;

    if (this._container.perfect) {
      let originPoint: Point = {
        x: elementRect.x + elementRect.width,
        y: elementRect.y
      };
      let angle = this._lastAngle;
      if (client.x > originPoint.x && client.y < elementRect.y) /* I */
        angle = (angle - 180);
      else if (client.x > originPoint.x) /* IV */
        angle = 360 - (angle - 180);
      else if (client.y < originPoint.y) /* II */
        angle = 180 - (angle - 180);

      client = Angle.lineFromVector(
        originPoint,
        angle,
        Angle.lineLength(originPoint, client)
      );
    }
    let width = (client.x) - (elementRect.x + elementRect.width);
    let height = client.y - (elementRect.y);

    this._lastResize = {
      x: elementRect.x + elementRect.width,
      y: elementRect.y,
      width: width,
      height: height
    };
    this.focus.setSize(this._lastResize);

    if (call) {
      this._container.call(Callback.RESIZE, {position: client, compass: Compass.SW});
    }
  }
  public override makeMouseUp(client: Point, call: boolean = true): void {
    super.makeMouseUp(client, call);

    if (call) {
      this._container.call(Callback.RESIZE_END, {position: client, compass: Compass.SW});
    }
  }
}
