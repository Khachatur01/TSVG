import {Grip} from "../Grip";
import {Point} from "../../../../../../../model/Point";

export class NGrip extends Grip {
  public setPosition(points: Point[]): void {
    let x = (points[1].x + points[0].x) / 2;
    let y = (points[1].y + points[0].y) / 2;
    this.position = {
      x: x - this.side + this.halfSide,
      y: y - this.halfSide
    }
  }

  protected onEnd(): void {
  }
  protected onMove(client: Point): void {
    let elementRect = this._container.focused.lastRect;
    let height = client.y - (elementRect.y + elementRect.height);

    this._lastResize = {
      x: elementRect.x,
      y: elementRect.y + elementRect.height,
      width: elementRect.width,
      height: height
    };
    this._container.focused.setSize(this._lastResize);
  }
  protected onStart(): void {
  }
}
