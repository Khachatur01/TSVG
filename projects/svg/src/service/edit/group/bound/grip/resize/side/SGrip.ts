import {Point} from "../../../../../../../model/Point";
import {Grip} from "../Grip";

export class SGrip extends Grip {
  public setPosition(points: Point[]): void {
    let x = (points[3].x + points[2].x) / 2;
    let y = (points[3].y + points[2].y) / 2;
    this.position = {
      x: x - this.halfSide,
      y: y - this.halfSide
    }
  }

  protected onEnd(): void {
  }
  protected onMove(client: Point): void {
    let elementRect = this._container.focused.lastRect;
    let height = client.y - (elementRect.y);

    this._lastResize = {
      x: elementRect.x,
      y: elementRect.y,
      width: elementRect.width,
      height: height
    };
    this._container.focused.setSize(this._lastResize);
  }
  protected onStart(): void {
  }
}
