import {Grip} from "../Grip";
import {Point} from "../../../../../../../model/Point";
import {Angle} from "../../../../../../math/Angle";

export class SWGrip extends Grip {
  public setPosition(points: Point[]): void {
    this.position = {
      x: points[3].x - this.halfSide,
      y: points[3].y - this.halfSide
    }
  }

  protected onStart(client: Point): void {
    this._lastAngle = Angle.fromPoints(
      {
        x: this._container.focused.lastRect.x + this._container.focused.lastRect.width,
        y: this._container.focused.lastRect.y
      },
      client,
      {x: 0, y: this._container.focused.lastRect.y + this._container.focused.lastRect.height}
    );
  }
  protected onMove(client: Point): void {
    let elementRect = this._container.focused.lastRect;

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
    this._container.focused.setSize(this._lastResize);
  }
  protected onEnd(): void {
  }
}
