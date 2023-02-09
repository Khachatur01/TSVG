import {MoveDrawable} from '../../../../../type/MoveDrawable';
import {MoveDraw} from "../../../../../mode/MoveDraw";
import {Point} from "../../../../../../../../model/Point";
import {RightTriangleView} from "../../../../../../../../element/shape/pointed/polygon/triangle/RightTriangleView";
import {SVGEvent} from "../../../../../../../../dataSource/constant/SVGEvent";
import {ElementType} from "../../../../../../../../dataSource/constant/ElementType";

export class DrawRightTriangle extends MoveDraw {
  protected createDrawableElement(position: Point): MoveDrawable {
    return new RightTriangleView(this.drawTool.container, {overEvent: true, globalStyle: true}, {x: 0, y: 0, width: 0, height: 0});
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.RIGHT_TRIANGLE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.RIGHT_TRIANGLE_TOOL_OFF);
    }
  }

  public _new(): DrawRightTriangle {
    return new DrawRightTriangle(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.RIGHT_TRIANGLE;
  }
}
