import {Point} from "../../../../../../../model/Point";
import {ElementView} from "../../../../../../../element/ElementView";
import {MoveDraw} from "../../../../mode/MoveDraw";
import {RightTriangleView} from "../../../../../../../element/shape/pointed/polygon/triangle/RightTriangleView";
import {TSVG} from "../../../../../../../TSVG";
import {Callback} from "../../../../../../../dataSource/Callback";

export class DrawRightTriangle extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    return new RightTriangleView(this.container);
  }

  public override start(container: TSVG) {
    super.start(container);
    container.call(Callback.RIGHT_TRIANGLE_TOOL_ON);
  }
  public override stop() {
    super.stop();
    this.container.call(Callback.RIGHT_TRIANGLE_TOOL_OFF);
  }

  public _new(): DrawRightTriangle {
    return new DrawRightTriangle(this.container);
  }
}
