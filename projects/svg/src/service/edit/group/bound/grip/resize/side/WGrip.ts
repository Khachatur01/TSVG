import {Grip} from "../Grip";
import {Point} from "../../../../../../../model/Point";

export class WGrip extends Grip {
  public setPosition(points: Point[]): void {
    let x = (points[3].x + points[0].x) / 2;
    let y = (points[3].y + points[0].y) / 2;
    this.position = {
      x: x - this.halfSide,
      y: y - this.halfSide
    }
  }

  protected onEnd(): void {
  }
  protected onMove(client: Point): void {
    let elementRect = this._container.focused.lastRect;
    let width = (client.x) - (elementRect.x + elementRect.width);

    this._lastResize = {
      x: elementRect.x + elementRect.width,
      y: elementRect.y,
      width: width,
      height: elementRect.height
    };
    this._container.focused.setSize(this._lastResize);
  }
  protected onStart(): void {
  }
}
