import {Grip} from "../Grip";
import {Point} from "../../../../../../../model/Point";
import {Angle} from "../../../../../../math/Angle";

export class NWGrip extends Grip {
  public setPosition(points: Point[]) {
    this.position = {
      x: points[0].x - this.halfSide,
      y: points[0].y - this.halfSide
    }
  }

  protected onStart(client: Point): void {
    this._lastAngle = 180 - Angle.fromPoints(
      {
        x: this._container.focused.lastRect.x + this._container.focused.lastRect.width,
        y: this._container.focused.lastRect.y + this._container.focused.lastRect.height
      },
      client,
      {
        x: this._container.focused.lastRect.x + this._container.focused.lastRect.width,
        y: this._container.focused.lastRect.y
      },
    );
  }
  protected onMove(client: Point): void {
    let elementRect = this._container.focused.lastRect;

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
    this._container.focused.setSize(this._lastResize);
  }
  protected onEnd(): void {
  }
}
