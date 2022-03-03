import {MoveDraw} from "../../../mode/MoveDraw";
import {ElementView} from "../../../../../../element/ElementView";
import {EllipseView} from "../../../../../../element/shape/EllipseView";
import {Point} from "../../../../../../model/Point";
import {TSVG} from "../../../../../../TSVG";
import {Callback} from "../../../../../../dataSource/Callback";

export class DrawEllipse extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    let element = new EllipseView(this.container, position);
    element.fixPosition();
    return element;
  }

  public override start(container: TSVG) {
    super.start(container);
    container.call(Callback.CIRCLE_TOOL_ON);
  }
  public override stop() {
    super.stop();
    this.container.call(Callback.CIRCLE_TOOL_OFF);
  }

  public _new(): DrawEllipse {
    return new DrawEllipse(this.container);
  }
}
