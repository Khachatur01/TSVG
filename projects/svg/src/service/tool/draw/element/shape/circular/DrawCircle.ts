import {MoveDraw} from '../../../mode/MoveDraw';
import {MoveDrawable} from '../../../type/MoveDrawable';
import {Point} from "../../../../../../model/Point";
import {CircleView} from "../../../../../../element/shape/circluar/CircleView";
import {SVGEvent} from "../../../../../../dataSource/constant/SVGEvent";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";

export class DrawCircle extends MoveDraw {
  protected createDrawableElement(position: Point): MoveDrawable {
    const element = new CircleView(this.drawTool.container, {overEvent: true, globalStyle: true}, {x: position.x, y: position.y, width: 0, height: 0});
    element.__fixRect__();
    return element;
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.CIRCLE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
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
