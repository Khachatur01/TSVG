import {ClickDraw} from '../../../../mode/ClickDraw';
import {Point} from "../../../../../../../model/Point";
import {PointedView} from "../../../../../../../element/shape/pointed/PointedView";
import {PolygonView} from "../../../../../../../element/shape/pointed/polygon/PolygonView";
import {SVGEvent} from "../../../../../../../dataSource/constant/SVGEvent";
import {ElementType} from "../../../../../../../dataSource/constant/ElementType";

export class DrawPolygon extends ClickDraw {
  protected createDrawableElement(position: Point): PointedView {
    return new PolygonView(this.drawTool.container, {overEvent: true, globalStyle: true}, [
      position, position
    ]);
  }

  public override start(call: boolean = true) {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.POLYGON_TOOL_ON);
    }
  }
  public override stop(call: boolean = true) {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.POLYGON_TOOL_OFF);
    }
  }

  public _new(): DrawPolygon {
    return new DrawPolygon(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.POLYGON;
  }
}
