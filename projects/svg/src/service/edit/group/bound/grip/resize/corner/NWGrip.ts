import {Grip} from '../Grip';
import {Point} from '../../../../../../../model/Point';
import {Angle} from '../../../../../../math/Angle';
import {SVGEvent} from '../../../../../../../dataSource/constant/SVGEvent';
import {Compass} from '../../../../../../../dataSource/constant/Compass';
import {Rect} from '../../../../../../../model/Rect';

export class NWGrip extends Grip {
  public __setPosition__(points: Point[]): void {
    this.__drag__({
      x: points[0].x - this.halfSide,
      y: points[0].y - this.halfSide
    });
  }

  public override makeMouseDown(client: Point, call: boolean = true): void {
    super.makeMouseDown(client, call);

    this._lastAngle = 180 - Angle.fromThreePoints(
      {
        x: this.focus.__lastRect__.x + this.focus.__lastRect__.width,
        y: this.focus.__lastRect__.y + this.focus.__lastRect__.height
      },
      client,
      {
        x: this.focus.__lastRect__.x + this.focus.__lastRect__.width,
        y: this.focus.__lastRect__.y
      },
    );

    if (call) {
      this._container.__call__(SVGEvent.RESIZE_MOUSE_DOWN, {position: client, compass: Compass.NW, elements: this.focus.children});
    }
  }
  public override makeMouseMove(client: Point, call: boolean = true): void {
    super.makeMouseMove(client, call);

    const elementRect: Rect = this.focus.__lastRect__;

    if (this._container.perfect || this.focus.proportionalResizable || this.focus.containsProportionalResizable()) {
      const originPoint: Point = {
        x: elementRect.x + elementRect.width,
        y: elementRect.y + elementRect.height
      };
      let angle: number = this._lastAngle;
      if (client.x > originPoint.x && client.y > originPoint.y) /* IV */{
        angle = 360 - (180 - angle);
      }
      else if (client.x > originPoint.x) /* I */{
        angle = 180 - angle;
      }
      else if (client.y > originPoint.y) /* III */{
        angle = 180 - (angle - 180);
      }

      client = Angle.lineFromVector(
        originPoint,
        angle,
        Angle.lineLength(originPoint, client)
      );
    }
    const width: number = (client.x) - (elementRect.x + elementRect.width);
    const height: number = (client.y) - (elementRect.y + elementRect.height);

    this._lastResize = {
      x: elementRect.x + elementRect.width,
      y: elementRect.y + elementRect.height,
      width,
      height
    };
    this.focus.__setRect__(this._lastResize);

    if (call) {
      this._container.__call__(SVGEvent.RESIZE_MOUSE_MOVE, {position: client, compass: Compass.NW});
    }
  }
  public override makeMouseUp(client: Point, call: boolean = true): void {
    super.makeMouseUp(client, call);

    if (call) {
      this._container.__call__(SVGEvent.RESIZE_MOUSE_UP, {position: client, compass: Compass.NW});
    }
  }
}
