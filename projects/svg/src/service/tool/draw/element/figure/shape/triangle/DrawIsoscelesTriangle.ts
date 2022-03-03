import {MoveDraw} from "../../../../mode/MoveDraw";
import {ElementView} from "../../../../../../../element/ElementView";
import {Point} from "../../../../../../../model/Point";
import {IsoscelesTriangleView} from "../../../../../../../element/shape/pointed/polygon/triangle/IsoscelesTriangleView";
import {TSVG} from "../../../../../../../TSVG";
import {Callback} from "../../../../../../../dataSource/Callback";

export class DrawIsoscelesTriangle extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    return new IsoscelesTriangleView(this.container);
  }

  public override start(container: TSVG) {
    super.start(container);
    container.call(Callback.ISOSCELES_TRIANGLE_TOOL_ON);
  }
  public override stop() {
    super.stop();
    this.container.call(Callback.ISOSCELES_TRIANGLE_TOOL_OFF);
  }

  public _new(): DrawIsoscelesTriangle {
    return new DrawIsoscelesTriangle(this.container);
  }
}
