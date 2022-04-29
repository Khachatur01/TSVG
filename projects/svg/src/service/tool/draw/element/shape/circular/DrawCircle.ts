import {MoveDraw} from "../../../mode/MoveDraw";
import {ElementView} from "../../../../../../element/ElementView";
import {Point} from "../../../../../../model/Point";
import {Event} from "../../../../../../dataSource/constant/Event";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";
import {CircleView} from "../../../../../../element/shape/circluar/CircleView";

export class DrawCircle extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    let element = new CircleView(this.container, {x: position.x, y: position.y, width: 0, height: 0});
    element.__fixRect__();
    return element;
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.container.__call__(Event.CIRCLE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.container.__call__(Event.CIRCLE_TOOL_OFF);
    }
  }

  public _new(): DrawCircle {
    return new DrawCircle(this.container);
  }
  public get type(): ElementType {
    return ElementType.CIRCLE;
  }
}