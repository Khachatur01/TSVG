import {Point} from "../../../../../../../model/Point";
import {ElementView} from "../../../../../../../element/ElementView";
import {MoveDraw} from "../../../../mode/MoveDraw";
import {RightTriangleView} from "../../../../../../../element/shape/pointed/polygon/triangle/RightTriangleView";
import {Callback} from "../../../../../../../dataSource/constant/Callback";
import {ElementType} from "../../../../../../../dataSource/constant/ElementType";

export class DrawRightTriangle extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    return new RightTriangleView(this.container);
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.container.call(Callback.RIGHT_TRIANGLE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.container.call(Callback.RIGHT_TRIANGLE_TOOL_OFF);
    }
  }

  public _new(): DrawRightTriangle {
    return new DrawRightTriangle(this.container);
  }
  public get type(): ElementType {
    return ElementType.RIGHT_TRIANGLE;
  }
}
