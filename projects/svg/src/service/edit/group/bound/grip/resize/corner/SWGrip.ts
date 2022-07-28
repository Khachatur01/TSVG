import {Grip} from "../Grip";
import {Point} from "../../../../../../../model/Point";
import {Angle} from "../../../../../../math/Angle";
import {Event} from "../../../../../../../dataSource/constant/Event";
import {Compass} from "../../../../../../../dataSource/constant/Compass";

export class SWGrip extends Grip {
  public __setPosition__(points: Point[]): void {
    this.__drag__({
      x: points[3].x - this.halfSide,
      y: points[3].y - this.halfSide
    });
  }

  public override makeMouseDown(client: Point, call: boolean = true): void {
    super.makeMouseDown(client, call);
    this._lastAngle = Angle.fromThreePoints(
      {
        x: this.focus.__lastRect__.x + this.focus.__lastRect__.width,
        y: this.focus.__lastRect__.y
      },
      client,
      {x: 0, y: this.focus.__lastRect__.y + this.focus.__lastRect__.height}
    );

    if (call) {
      this._container.__call__(Event.RESIZE_MOUSE_DOWN, {position: client, compass: Compass.SW, elements: this.focus.children});
    }
  }
  public override makeMouseMove(client: Point, call: boolean = true): void {
    super.makeMouseMove(client, call);
    let elementRect = this.focus.__lastRect__;

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
    this.focus.__setRect__(this._lastResize);

    if (call) {
      this._container.__call__(Event.RESIZE_MOUSE_MOVE, {position: client, compass: Compass.SW});
    }
  }
  public override makeMouseUp(client: Point, call: boolean = true): void {
    super.makeMouseUp(client, call);

    if (call) {
      this._container.__call__(Event.RESIZE_MOUSE_UP, {position: client, compass: Compass.SW});
    }
  }
}
