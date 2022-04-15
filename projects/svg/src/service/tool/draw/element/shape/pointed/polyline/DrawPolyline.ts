import {ClickDraw} from "../../../../mode/ClickDraw";
import {PolylineView} from "../../../../../../../element/shape/pointed/polyline/PolylineView";
import {PointedView} from "../../../../../../../element/shape/pointed/PointedView";
import {Point} from "../../../../../../../model/Point";
import {Callback} from "../../../../../../../dataSource/constant/Callback";
import {ElementType} from "../../../../../../../dataSource/constant/ElementType";

export class DrawPolyline extends ClickDraw {
  protected createDrawableElement(position: Point): PointedView {
    return new PolylineView(this.container, [
      position, position
    ]);
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.container.call(Callback.POLYLINE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.container.call(Callback.POLYLINE_TOOL_OFF);
    }
  }

  public _new(): DrawPolyline {
    return new DrawPolyline(this.container);
  }
  public get type(): ElementType {
    return ElementType.POLYLINE;
  }
}
