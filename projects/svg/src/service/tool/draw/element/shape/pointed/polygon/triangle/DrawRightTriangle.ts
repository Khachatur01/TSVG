import {Point} from "../../../../../../../../model/Point";
import {ElementView} from "../../../../../../../../element/ElementView";
import {MoveDraw} from "../../../../../mode/MoveDraw";
import {RightTriangleView} from "../../../../../../../../element/shape/pointed/polygon/triangle/RightTriangleView";
import {Event} from "../../../../../../../../dataSource/constant/Event";
import {ElementType} from "../../../../../../../../dataSource/constant/ElementType";

export class DrawRightTriangle extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    return new RightTriangleView(this.container, {x: 0, y: 0, width: 0, height: 0});
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.container.__call__(Event.RIGHT_TRIANGLE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.container.__call__(Event.RIGHT_TRIANGLE_TOOL_OFF);
    }
  }

  public _new(): DrawRightTriangle {
    return new DrawRightTriangle(this.container);
  }
  public get type(): ElementType {
    return ElementType.RIGHT_TRIANGLE;
  }
}
