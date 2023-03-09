import {DrawTwoPoint} from '../../DrawTwoPoint';
import {Point} from '../../../../../../model/Point';
import {PointedView} from '../../../../../../element/shape/pointed/PointedView';
import {LineView} from '../../../../../../element/shape/pointed/LineView';
import {SVGEvent} from '../../../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../../../dataSource/constant/ElementType';

export class DrawLine extends DrawTwoPoint {
  protected createDrawableElement(position: Point): PointedView {
    const element: LineView = new LineView(this.drawTool.container, {overEvent: true, globalStyle: true}, position, position);
    element.__fixRect__();
    return element;
  }

  public override start(call: boolean = true): void {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.LINE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true): void {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.LINE_TOOL_OFF);
    }
  }

  public _new(): DrawLine {
    return new DrawLine(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.LINE;
  }
}
