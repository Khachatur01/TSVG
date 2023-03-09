import {Grip} from '../Grip';
import {Point} from '../../../../../../../model/Point';
import {Angle} from '../../../../../../math/Angle';
import {SVGEvent} from '../../../../../../../dataSource/constant/SVGEvent';
import {Compass} from '../../../../../../../dataSource/constant/Compass';

export class SEGrip extends Grip {
  public __setPosition__(points: Point[]): void {
    this.__drag__({
      x: points[2].x - this.halfSide,
      y: points[2].y - this.halfSide
    });
  }

  public override makeMouseDown(client: Point, call: boolean = true): void {
    super.makeMouseDown(client, call);
    this._lastAngle = Angle.fromThreePoints(
      this.focus.__lastRect__,
      client,
      {x: 0, y: client.y}
    );

    if (call) {
      this._container.__call__(SVGEvent.RESIZE_MOUSE_DOWN, {position: client, compass: Compass.SE, elements: this.focus.children});
    }
  }
  public override makeMouseMove(client: Point, call: boolean = true): void {
    super.makeMouseMove(client, call);
    const position: Point = this.focus.__lastRect__;

    if (this._container.perfect) {
      let angle: number = this._lastAngle;
      if (client.x < position.x && client.y < position.y) /* II */{
        angle = 180 - (360 - angle);
      }
      else if (client.x < position.x) /* III */{
        angle = 180 + (360 - angle);
      }
      else if (client.y < position.y) /* I */{
        angle = 360 - angle;
      }

      client = Angle.lineFromVector(
        this.focus.__lastRect__,
        angle,
        Angle.lineLength(position, client)
      );
    }
    const width: number = client.x - position.x;
    const height: number = client.y - position.y;

    this._lastResize = {
      x: position.x,
      y: position.y,
      width,
      height
    };
    this.focus.__setRect__(this._lastResize);

    if (call) {
      this._container.__call__(SVGEvent.RESIZE_MOUSE_MOVE, {position: client, compass: Compass.SE});
    }
  }
  public override makeMouseUp(client: Point, call: boolean = true): void {
    super.makeMouseUp(client, call);

    if (call) {
      this._container.__call__(SVGEvent.RESIZE_MOUSE_UP, {position: client, compass: Compass.SE});
    }
  }
}
