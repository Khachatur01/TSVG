import {ClickDraw} from "../../../mode/ClickDraw";
import {PolylineView} from "../../../../../../element/shape/pointed/polyline/PolylineView";
import {PointedView} from "../../../../../../element/shape/pointed/PointedView";
import {Point} from "../../../../../../model/Point";
import {TSVG} from "../../../../../../TSVG";
import {Callback} from "../../../../../../dataSource/Callback";

export class DrawPolyline extends ClickDraw {
  protected createDrawableElement(position: Point): PointedView {
    return new PolylineView(this.container, [
      position, position
    ]);
  }

  public override start(container: TSVG) {
    super.start(container);
    container.call(Callback.POLYLINE_TOOL_ON);
  }
  public override stop() {
    super.stop();
    this.container.call(Callback.POLYLINE_TOOL_OFF);
  }

  public _new(): DrawPolyline {
    return new DrawPolyline(this.container);
  }
}
