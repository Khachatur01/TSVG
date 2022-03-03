import {Grip} from "../Grip";
import {Point} from "../../../../../../../model/Point";

export class EGrip extends Grip {
  public setPosition(points: Point[]): void {
    let x = (points[2].x + points[1].x) / 2;
    let y = (points[2].y + points[1].y) / 2;
    this.position = {
      x: x - this.halfSide,
      y: y - this.halfSide
    }
  }

  protected onEnd(): void {
  }
  protected onMove(client: Point): void {
    let elementRect = this._container.focused.lastRect;

    this._lastResize = {
      x: elementRect.x,
      y: elementRect.y,
      width: (client.x) - (elementRect.x),
      height: elementRect.height
    };
    this._container.focused.setSize(this._lastResize);
  }
  protected onStart(): void {
  }
}
