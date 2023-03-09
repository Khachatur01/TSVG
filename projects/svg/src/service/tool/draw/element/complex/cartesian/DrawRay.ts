import {DrawTwoPoint} from '../../DrawTwoPoint';
import {Point} from '../../../../../../model/Point';
import {RayView} from '../../../../../../element/complex/cartesian/RayView';
import {SVGEvent} from '../../../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../../../dataSource/constant/ElementType';

export class DrawRay extends DrawTwoPoint {
  protected createDrawableElement(position: Point): RayView {
    const element: RayView = new RayView(this.drawTool.container, {overEvent: true, globalStyle: true}, {}, position, position);
    element.__fixRect__();
    return element;
  }

  public override start(call: boolean = true): void {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.RAY_TOOL_ON);
    }
  }
  public override stop(call: boolean = true): void {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.RAY_TOOL_OFF);
    }
  }

  public _new(): DrawRay {
    return new DrawRay(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.RAY;
  }
}
