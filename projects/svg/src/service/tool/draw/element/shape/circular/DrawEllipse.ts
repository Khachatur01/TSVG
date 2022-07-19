import {MoveDraw} from "../../../mode/MoveDraw";
import {ElementView} from "../../../../../../element/ElementView";
import {EllipseView} from "../../../../../../element/shape/circluar/EllipseView";
import {Point} from "../../../../../../model/Point";
import {Event} from "../../../../../../dataSource/constant/Event";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";
import {MoveDrawable} from "../../../type/MoveDrawable";

export class DrawEllipse extends MoveDraw {
  protected createDrawableElement(position: Point): MoveDrawable {
    let element = new EllipseView(this.container, {overEvent: true, globalStyle: true}, {x: position.x, y: position.y, width: 0, height: 0});
    element.__fixRect__();
    return element;
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.container.__call__(Event.ELLIPSE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.container.__call__(Event.ELLIPSE_TOOL_OFF);
    }
  }

  public _new(): DrawEllipse {
    return new DrawEllipse(this.container);
  }
  public get type(): ElementType {
    return ElementType.ELLIPSE;
  }
}
