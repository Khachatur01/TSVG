import {MoveDraw} from "../../../../../mode/MoveDraw";
import {ElementView} from "../../../../../../../../element/ElementView";
import {RectangleView} from "../../../../../../../../element/shape/pointed/polygon/rectangle/RectangleView";
import {Point} from "../../../../../../../../model/Point";
import {Callback} from "../../../../../../../../dataSource/constant/Callback";
import {ElementType} from "../../../../../../../../dataSource/constant/ElementType";

export class DrawRectangle extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    return new RectangleView(this.container, {x: position.x, y: position.y, width: 0, height: 0});
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.container.call(Callback.RECTANGLE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.container.call(Callback.RECTANGLE_TOOL_OFF);
    }
  }

  public _new(): DrawRectangle {
    return new DrawRectangle(this.container);
  }
  public get type(): ElementType {
    return ElementType.RECTANGLE;
  }
}
