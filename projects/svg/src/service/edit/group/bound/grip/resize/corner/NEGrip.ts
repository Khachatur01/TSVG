import {Grip} from "../Grip";
import {Point} from "../../../../../../../model/Point";
import {Angle} from "../../../../../../math/Angle";
import {Callback} from "../../../../../../../dataSource/constant/Callback";
import {Compass} from "../../../../../../../dataSource/constant/Compass";

export class NEGrip extends Grip {
  public setPosition(points: Point[]): void {
    this.position = {
      x: points[1].x - this.halfSide,
      y: points[1].y - this.halfSide
    };
  }

  public override makeMouseDown(client: Point, call: boolean = true): void {
    super.makeMouseDown(client, call);
    this._lastAngle = Angle.fromPoints(
      {
        x: this.focus.lastRect.x,
        y: this.focus.lastRect.y + this.focus.lastRect.height
      },
      client,
      {x: 0, y: this.focus.lastRect.y}
    );

    if (call) {
      this._container.call(Callback.RESIZE_START, {position: client, compass: Compass.NE, elements: this.focus.children});
    }
  }
  public override makeMouseMove(client: Point, call: boolean = true): void {
    super.makeMouseMove(client, call);
    let elementRect = this.focus.lastRect;

    if (this._container.perfect) {
      let originPoint: Point = {
        x: elementRect.x,
        y: elementRect.y + elementRect.height
      };
      let angle = this._lastAngle;
      if (client.x < originPoint.x && client.y > originPoint.y) /* III */
        angle = 180 + angle;
      else if (client.x > originPoint.x && client.y > originPoint.y) /* IV */
        angle = 360 - angle;
      else if (client.y <= originPoint.y && client.x <= originPoint.x) /* II */
        angle = 180 - angle;

      client = Angle.lineFromVector(
        originPoint,
        angle,
        Angle.lineLength(originPoint, client)
      );
    }
    let width = (client.x) - (elementRect.x);
    let height = client.y - (elementRect.y + elementRect.height);

    this._lastResize = {
      x: elementRect.x,
      y: elementRect.y + elementRect.height,
      width: width,
      height: height
    };
    this.focus.setSize(this._lastResize);

    if (call) {
      this._container.call(Callback.RESIZE, {position: client, compass: Compass.NE});
    }
  }
  public override makeMouseUp(client: Point, call: boolean = true): void {
    super.makeMouseUp(client, call);

    if (call) {
      this._container.call(Callback.RESIZE_END, {position: client, compass: Compass.NE});
    }
  }
}
