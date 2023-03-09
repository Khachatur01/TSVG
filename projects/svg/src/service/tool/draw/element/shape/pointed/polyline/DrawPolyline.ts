import {ClickDrawer} from '../../../../mode/ClickDrawer';
import {Point} from '../../../../../../../model/Point';
import {PointedView} from '../../../../../../../element/shape/pointed/PointedView';
import {PolylineView} from '../../../../../../../element/shape/pointed/polyline/PolylineView';
import {SVGEvent} from '../../../../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../../../../dataSource/constant/ElementType';

export class DrawPolyline extends ClickDrawer {
  protected createDrawableElement(position: Point): PointedView {
    return new PolylineView(this.drawTool.container, {overEvent: true, globalStyle: true}, [
      position, position
    ]);
  }

  public override start(call: boolean = true): void {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.POLYLINE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true): void {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.POLYLINE_TOOL_OFF);
    }
  }

  public _new(): DrawPolyline {
    return new DrawPolyline(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.POLYLINE;
  }
}
