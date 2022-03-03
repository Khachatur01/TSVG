import {MoveDraw} from "../../../mode/MoveDraw";
import {ElementView} from "../../../../../../element/ElementView";
import {RectangleView} from "../../../../../../element/shape/pointed/polygon/rectangle/RectangleView";
import {Point} from "../../../../../../model/Point";
import {TSVG} from "../../../../../../TSVG";
import {Callback} from "../../../../../../dataSource/Callback";

export class DrawRectangle extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    return new RectangleView(this.container, position);
  }

  public override start(container: TSVG) {
    super.start(container);
    container.call(Callback.RECTANGLE_TOOL_ON);
  }
  public override stop() {
    super.stop();
    this.container.call(Callback.RECTANGLE_TOOL_OFF);
  }

  public _new(): DrawRectangle {
    return new DrawRectangle(this.container);
  }
}
