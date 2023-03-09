import {MoveDrawer} from '../../../mode/MoveDrawer';
import {Axis, NumberLineView2} from '../../../../../../element/complex/cartesian2/NumberLineView2';
import {Point} from '../../../../../../model/Point';
import {MoveDrawable} from '../../../type/MoveDrawable';
import {SVGEvent} from '../../../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../../../dataSource/constant/ElementType';

export class DrawNumberLine2 extends MoveDrawer {
  public xAxis: Axis | undefined = undefined;
  protected createDrawableElement(position: Point): MoveDrawable {
    return new NumberLineView2(
      this.drawTool.container,
      {overEvent: true, globalStyle: true},
      {x: position.x, y: position.y, width: 1, height: 1},
      this.xAxis
    );
  }

  protected override onIsNotComplete(call: boolean): void {
    if (!this._drawableElement) {
      return;
    }
    (this._drawableElement as unknown as MoveDrawable).__drawSize__({
      x: this.startPosition.x - 200,
      y: this.startPosition.y - 50,
      width: 400,
      height: 100
    });
    this._drawableElement.refPoint = this._drawableElement.center;
  }
  protected override onEnd(call: boolean): void {
  }

  public override start(call: boolean): void {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.NUMBER_LINE_TOOL2_ON);
    }
  }
  public override stop(call: boolean): void {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.NUMBER_LINE_TOOL2_OFF);
    }
  }

  public _new(): DrawNumberLine2 {
    return new DrawNumberLine2(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.NUMBER_LINE2;
  }
}
