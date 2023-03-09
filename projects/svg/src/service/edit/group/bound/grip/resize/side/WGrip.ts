import {Grip} from '../Grip';
import {Point} from '../../../../../../../model/Point';
import {SVGEvent} from '../../../../../../../dataSource/constant/SVGEvent';
import {Compass} from '../../../../../../../dataSource/constant/Compass';
import {Rect} from '../../../../../../../model/Rect';

export class WGrip extends Grip {
  public __setPosition__(points: Point[]): void {
    const x: number = (points[3].x + points[0].x) / 2;
    const y: number = (points[3].y + points[0].y) / 2;
    this.__drag__({
      x: x - this.halfSide,
      y: y - this.halfSide
    });
  }

  public override makeMouseDown(client: Point, call: boolean = true): void {
    super.makeMouseDown(client, call);

    if (call) {
      this._container.__call__(SVGEvent.RESIZE_MOUSE_DOWN, {position: client, compass: Compass.W, elements: this.focus.children});
    }
  }
  public override makeMouseMove(client: Point, call: boolean = true): void {
    super.makeMouseMove(client, call);
    const elementRect: Rect = this.focus.__lastRect__;
    const width: number = (client.x) - (elementRect.x + elementRect.width);

    this._lastResize = {
      x: elementRect.x + elementRect.width,
      y: elementRect.y,
      width,
      height: elementRect.height
    };
    this.focus.__setRect__(this._lastResize);

    if (call) {
      this._container.__call__(SVGEvent.RESIZE_MOUSE_MOVE, {position: client, compass: Compass.W});
    }
  }
  public override makeMouseUp(client: Point, call: boolean = true): void {
    super.makeMouseUp(client, call);

    if (call) {
      this._container.__call__(SVGEvent.RESIZE_MOUSE_UP, {position: client, compass: Compass.W});
    }
  }
}
