import {MoveDrawer} from '../../../../../mode/MoveDrawer';
import {MoveDrawable} from '../../../../../type/MoveDrawable';
import {Point} from '../../../../../../../../model/Point';
import {
  IsoscelesTriangleView
} from '../../../../../../../../element/shape/pointed/polygon/triangle/IsoscelesTriangleView';
import {SVGEvent} from '../../../../../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../../../../../dataSource/constant/ElementType';

export class DrawIsoscelesTriangle extends MoveDrawer {
  protected createDrawableElement(position: Point): MoveDrawable {
    return new IsoscelesTriangleView(this.drawTool.container, {overEvent: true, globalStyle: true}, {x: 0, y: 0, width: 0, height: 0});
  }

  public override start(call: boolean = true): void {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.ISOSCELES_TRIANGLE_TOOL_ON);
    }
  }
  public override stop(call: boolean = true): void {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.ISOSCELES_TRIANGLE_TOOL_OFF);
    }
  }

  public _new(): DrawIsoscelesTriangle {
    return new DrawIsoscelesTriangle(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.ISOSCELES_TRIANGLE;
  }
}
