import {Grip} from "../Grip";
import {Point} from "../../../../../../../model/Point";
import {Angle} from "../../../../../../math/Angle";
import {Event} from "../../../../../../../dataSource/constant/Event";
import {Compass} from "../../../../../../../dataSource/constant/Compass";

export class NEGrip extends Grip {
  public __setPosition__(points: Point[]): void {
    this.__drag__({
      x: points[1].x - this.halfSide,
      y: points[1].y - this.halfSide
    });
  }

  public override makeMouseDown(client: Point, call: boolean = true): void {
    super.makeMouseDown(client, call);
    this.___lastAngle__ = Angle.fromPoints(
      {
        x: this.focus.__lastRect__.x,
        y: this.focus.__lastRect__.y + this.focus.__lastRect__.height
      },
      client,
      {x: 0, y: this.focus.__lastRect__.y}
    );

    if (call) {
      this._container.__call__(Event.RESIZE_MOUSE_DOWN, {position: client, compass: Compass.NE, elements: this.focus.children});
    }
  }
  public override makeMouseMove(client: Point, call: boolean = true): void {
    super.makeMouseMove(client, call);
    let elementRect = this.focus.__lastRect__;

    if (this._container.perfect) {
      let originPoint: Point = {
        x: elementRect.x,
        y: elementRect.y + elementRect.height
      };
      let angle = this.___lastAngle__;
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
    this.focus.__setRect__(this._lastResize);

    if (call) {
      this._container.__call__(Event.RESIZE_MOUSE_MOVE, {position: client, compass: Compass.NE});
    }
  }
  public override makeMouseUp(client: Point, call: boolean = true): void {
    super.makeMouseUp(client, call);

    if (call) {
      this._container.__call__(Event.RESIZE_MOUSE_UP, {position: client, compass: Compass.NE});
    }
  }
}
