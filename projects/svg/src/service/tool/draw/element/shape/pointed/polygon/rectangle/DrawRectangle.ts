import {MoveDraw} from "../../../../../mode/MoveDraw";
import {Point} from "../../../../../../../../model/Point";
import {MoveDrawable} from "../../../../../type/MoveDrawable";
import {RectangleView} from "../../../../../../../../element/shape/pointed/polygon/rectangle/RectangleView";
import {SVGEvent} from "../../../../../../../../dataSource/constant/SVGEvent";
import {ElementType} from "../../../../../../../../dataSource/constant/ElementType";

export class DrawRectangle extends MoveDraw {
  protected createDrawableElement(position: Point): MoveDrawable {
    return new RectangleView(this.drawTool.container, {overEvent: true, globalStyle: true}, {x: position.x, y: position.y, width: 0, height: 0});
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.RECTANGLE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.RECTANGLE_TOOL_OFF);
    }
  }

  public _new(): DrawRectangle {
    return new DrawRectangle(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.RECTANGLE;
  }
}
