import {MoveDrawer} from '../../../mode/MoveDrawer';
import {Style} from '../../../../../style/Style';
import {MoveDrawable} from '../../../type/MoveDrawable';
import {Axis, CoordinatePlaneView2, Grid} from '../../../../../../element/complex/cartesian2/CoordinatePlaneView2';
import {Point} from '../../../../../../model/Point';
import {SVGEvent} from '../../../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../../../dataSource/constant/ElementType';

export class DrawCoordinatePlane2 extends MoveDrawer {
  public functions: {f: (value: number) => any; style: Style}[] = [];
  public xAxis: Axis | undefined = undefined;
  public yAxis: Axis | undefined = undefined;
  public grid: Grid = {show: true, byX: 1, byY: 1};
  protected createDrawableElement(position: Point): MoveDrawable {
    return new CoordinatePlaneView2(
      this.drawTool.container,
      {overEvent: true, globalStyle: true},
      {x: position.x, y: position.y, width: 1, height: 1},
      this.xAxis,
      this.yAxis,
      this.grid,
      this.functions
    );
  }

  protected override onIsNotComplete(call: boolean): void {
    if (!this._drawableElement) {
      return;
    }
    (this._drawableElement as unknown as MoveDrawable).__drawSize__({
      x: this.startPosition.x - 200,
      y: this.startPosition.y - 200,
      width: 400,
      height: 400
    });
    this._drawableElement.refPoint = this._drawableElement.center;
  }
  protected override onEnd(call: boolean): void {
  }

  public override start(call: boolean): void {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.COORDINATE_PLANE2_TOOL_ON);
    }
  }
  public override stop(call: boolean): void {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.COORDINATE_PLANE2_TOOL_OFF);
    }
  }

  public _new(): DrawCoordinatePlane2 {
    return new DrawCoordinatePlane2(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.COORDINATE_PLANE2;
  }
}
