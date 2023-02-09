import {MoveDraw} from '../../../mode/MoveDraw';
import {MoveDrawable} from '../../../type/MoveDrawable';
import {Point} from "../../../../../../model/Point";
import {EllipseView} from "../../../../../../element/shape/circluar/EllipseView";
import {SVGEvent} from "../../../../../../dataSource/constant/SVGEvent";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";

export class DrawEllipse extends MoveDraw {
  protected createDrawableElement(position: Point): MoveDrawable {
    const element = new EllipseView(this.drawTool.container, {overEvent: true, globalStyle: true}, {x: position.x, y: position.y, width: 0, height: 0});
    element.__fixRect__();
    return element;
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.ELLIPSE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.ELLIPSE_TOOL_OFF);
    }
  }

  public _new(): DrawEllipse {
    return new DrawEllipse(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.ELLIPSE;
  }
}
