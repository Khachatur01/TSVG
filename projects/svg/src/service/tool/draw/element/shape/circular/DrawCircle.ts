import {MoveDrawer} from '../../../mode/MoveDrawer';
import {MoveDrawable} from '../../../type/MoveDrawable';
import {Point} from '../../../../../../model/Point';
import {CircleView} from '../../../../../../element/shape/circluar/CircleView';
import {SVGEvent} from '../../../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../../../dataSource/constant/ElementType';
import {Rect} from "../../../../../../model/Rect";

export class DrawCircle extends MoveDrawer {
  public showCenter: boolean = true;

  protected createDrawableElement(position: Point): MoveDrawable {
    const element: CircleView = new CircleView(this.drawTool.container, {overEvent: true, globalStyle: true, showCenter: this.showCenter}, {x: position.x, y: position.y, width: 0, height: 0});
    element.__fixRect__();
    return element;
  }

  public override makeMouseMove(position: Point, call: boolean = true, parameter?: any): void {
    let width: number = position.x - this.startPosition.x;
    let height: number = position.y - this.startPosition.y;

    if (this.drawTool.container.grid.isSnapOn()) {
      const snapPoint: Point = this.drawTool.container.grid.getSnapPoint({
        x: this.startPosition.x + width,
        y: this.startPosition.y + height
      });
      width = snapPoint.x - this.startPosition.x;
      height = snapPoint.y - this.startPosition.y;
    }

    const rect: Rect = {
      x: this.startPosition.x,
      y: this.startPosition.y,
      width,
      height
    };

    if (this.drawTool.mirroring) {
      rect.x -= width;
      rect.y -= height;

      rect.width *= 2;
      rect.height *= 2;
    } else {
      const averageSize: number = (Math.abs(width) + Math.abs(height)) / 2;
      if (rect.width < 0) {
        rect.width = -averageSize;
      } else {
        rect.width = averageSize;
      }
      if (rect.height < 0) {
        rect.height = -averageSize;
      } else {
        rect.height = averageSize;
      }
    }

    /* if _drawableElement instance of MoveDrawable, set drawSize */
    (this._drawableElement as unknown as MoveDrawable).__drawSize__(rect);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.DRAW_MOUSE_MOVE, {position, element: this._drawableElement});
    }
  }

  public override start(call: boolean = true): void {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.CIRCLE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true): void {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.CIRCLE_TOOL_OFF);
    }
  }

  public _new(): DrawCircle {
    return new DrawCircle(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.CIRCLE;
  }
}
