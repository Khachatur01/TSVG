import {Grip} from "../Grip";
import {Point} from "../../../../../../../model/Point";
import {Angle} from "../../../../../../math/Angle";

export class SEGrip extends Grip {
  public setPosition(points: Point[]): void {
    this.position = {
      x: points[2].x - this.halfSide,
      y: points[2].y - this.halfSide
    }
  }

  protected onStart(client: Point): void {
    this._lastAngle = Angle.fromPoints(
      this._container.focused.lastRect,
      client,
      {x: 0, y: client.y}
    );
  }
  protected onMove(client: Point): void {
    let position = this._container.focused.lastRect;

    if (this._container.perfect) {
      let angle = this._lastAngle;
      if (client.x < position.x && client.y < position.y) /* II */
        angle = 180 - (360 - angle);
      else if (client.x < position.x) /* III */
        angle = 180 + (360 - angle);
      else if (client.y < position.y) /* I */
        angle = 360 - angle;

      client = Angle.lineFromVector(
        this._container.focused.lastRect,
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
    this._container.focused.setSize(this._lastResize);
  }
  protected onEnd(): void {
  }
}
