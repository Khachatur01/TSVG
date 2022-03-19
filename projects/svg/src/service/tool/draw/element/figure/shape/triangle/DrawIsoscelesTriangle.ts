import {MoveDraw} from "../../../../mode/MoveDraw";
import {ElementView} from "../../../../../../../element/ElementView";
import {Point} from "../../../../../../../model/Point";
import {IsoscelesTriangleView} from "../../../../../../../element/shape/pointed/polygon/triangle/IsoscelesTriangleView";
import {Callback} from "../../../../../../../dataSource/constant/Callback";
import {ElementType} from "../../../../../../../dataSource/constant/ElementType";

export class DrawIsoscelesTriangle extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    return new IsoscelesTriangleView(this.container);
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.container.call(Callback.ISOSCELES_TRIANGLE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.container.call(Callback.ISOSCELES_TRIANGLE_TOOL_OFF);
    }
  }

  public _new(): DrawIsoscelesTriangle {
    return new DrawIsoscelesTriangle(this.container);
  }
  public get type(): ElementType {
    return ElementType.ISOSCELES_TRIANGLE;
  }
}
