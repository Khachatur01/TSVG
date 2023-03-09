import {MoveDrawer} from '../../../mode/MoveDrawer';
import {Point} from '../../../../../../model/Point';
import {MoveDrawable} from '../../../type/MoveDrawable';
import {NumberLineView} from '../../../../../../element/complex/cartesian/NumberLineView';
import {SVGEvent} from '../../../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../../../dataSource/constant/ElementType';

export class DrawNumberLine extends MoveDrawer {
  protected createDrawableElement(position: Point): MoveDrawable {
    return new NumberLineView(this.drawTool.container, {overEvent: true, globalStyle: false}, {
      x: position.x,
      y: position.y,
      width: 1,
      height: 1
    });
  }

  protected override onIsNotComplete(call: boolean): void {
    if (!this._drawableElement) {return;}
    (this._drawableElement as unknown as MoveDrawable).__drawSize__({
      x: this.startPosition.x - 150,
      y: this.startPosition.y - 25,
      width: 300,
      height: 50
    });
    this._drawableElement.refPoint = this._drawableElement.center;
  }
  protected override onEnd(call: boolean): void {
  }

  public override start(call: boolean): void {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.NUMBER_LINE_TOOL_ON);
    }
  }
  public override stop(call: boolean): void {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.NUMBER_LINE_TOOL_OFF);
    }
  }

  public _new(): DrawNumberLine {
    return new DrawNumberLine(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.NUMBER_LINE;
  }
}
