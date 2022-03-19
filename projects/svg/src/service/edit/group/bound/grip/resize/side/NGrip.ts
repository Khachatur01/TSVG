import {Grip} from "../Grip";
import {Point} from "../../../../../../../model/Point";
import {Callback} from "../../../../../../../dataSource/constant/Callback";
import {Compass} from "../../../../../../../dataSource/constant/Compass";

export class NGrip extends Grip {
  public setPosition(points: Point[]): void {
    let x = (points[1].x + points[0].x) / 2;
    let y = (points[1].y + points[0].y) / 2;
    this.position = {
      x: x - this.side + this.halfSide,
      y: y - this.halfSide
    }
  }

  public override makeMouseDown(client: Point, call: boolean = true): void {
    super.makeMouseDown(client, call);

    if (call) {
      this._container.call(Callback.RESIZE_START, {position: client, compass: Compass.N, elements: this.focus.children});
    }
  }
  public override makeMouseMove(client: Point, call: boolean = true): void {
    super.makeMouseMove(client, call);
    let elementRect = this.focus.lastRect;
    let height = client.y - (elementRect.y + elementRect.height);

    this._lastResize = {
      x: elementRect.x,
      y: elementRect.y + elementRect.height,
      width: elementRect.width,
      height: height
    };
    this.focus.setSize(this._lastResize);

    if (call) {
      this._container.call(Callback.RESIZE, {position: client, compass: Compass.N});
    }
  }
  public override makeMouseUp(client: Point, call: boolean = true): void {
    super.makeMouseUp(client, call);

    if (call) {
      this._container.call(Callback.RESIZE_END, {position: client, compass: Compass.N});
    }
  }
}
