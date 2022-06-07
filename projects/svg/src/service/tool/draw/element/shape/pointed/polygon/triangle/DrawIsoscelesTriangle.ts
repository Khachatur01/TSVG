import {MoveDraw} from "../../../../../mode/MoveDraw";
import {ElementView} from "../../../../../../../../element/ElementView";
import {Point} from "../../../../../../../../model/Point";
import {
  IsoscelesTriangleView
} from "../../../../../../../../element/shape/pointed/polygon/triangle/IsoscelesTriangleView";
import {Event} from "../../../../../../../../dataSource/constant/Event";
import {ElementType} from "../../../../../../../../dataSource/constant/ElementType";

export class DrawIsoscelesTriangle extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    return new IsoscelesTriangleView(this.container, {overEvent: true, globalStyle: true}, {x: 0, y: 0, width: 0, height: 0});
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.container.__call__(Event.ISOSCELES_TRIANGLE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.container.__call__(Event.ISOSCELES_TRIANGLE_TOOL_OFF);
    }
  }

  public _new(): DrawIsoscelesTriangle {
    return new DrawIsoscelesTriangle(this.container);
  }
  public get type(): ElementType {
    return ElementType.ISOSCELES_TRIANGLE;
  }
}
