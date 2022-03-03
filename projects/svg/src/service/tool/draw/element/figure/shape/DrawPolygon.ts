import {ClickDraw} from "../../../mode/ClickDraw";
import {PointedView} from "../../../../../../element/shape/pointed/PointedView";
import {Point} from "../../../../../../model/Point";
import {TSVG} from "../../../../../../TSVG";
import {Callback} from "../../../../../../dataSource/Callback";
import {PolygonView} from "../../../../../../element/shape/pointed/polygon/PolygonView";

export class DrawPolygon extends ClickDraw {
  protected createDrawableElement(position: Point): PointedView {
    return new PolygonView(this.container, [
      position, position
    ]);
  }

  public override start(container: TSVG) {
    super.start(container);
    container.call(Callback.POLYGON_TOOL_ON);
  }
  public override stop() {
    super.stop();
    this.container.call(Callback.POLYGON_TOOL_OFF);
  }

  public _new(): DrawPolygon {
    return new DrawPolygon(this.container);
  }
}
