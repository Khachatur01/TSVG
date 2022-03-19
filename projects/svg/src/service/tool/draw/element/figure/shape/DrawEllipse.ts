import {MoveDraw} from "../../../mode/MoveDraw";
import {ElementView} from "../../../../../../element/ElementView";
import {EllipseView} from "../../../../../../element/shape/EllipseView";
import {Point} from "../../../../../../model/Point";
import {Callback} from "../../../../../../dataSource/constant/Callback";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";

export class DrawEllipse extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    let element = new EllipseView(this.container, position);
    element.fixPosition();
    return element;
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.container.call(Callback.CIRCLE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.container.call(Callback.CIRCLE_TOOL_OFF);
    }
  }

  public _new(): DrawEllipse {
    return new DrawEllipse(this.container);
  }
  public get type(): ElementType {
    return ElementType.ELLIPSE;
  }
}
