import {MoveDraw} from '../../../mode/MoveDraw';
import {Point} from "../../../../../../model/Point";
import {MoveDrawable} from "../../../type/MoveDrawable";
import {NumberLineView} from "../../../../../../element/complex/cartesian/NumberLineView";
import {SVGEvent} from "../../../../../../dataSource/constant/SVGEvent";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";

export class DrawNumberLine extends MoveDraw {
  public xAxis = undefined;
  protected createDrawableElement(position: Point): MoveDrawable {
    return new NumberLineView(
      this.drawTool.container,
      {overEvent: true, globalStyle: true},
      {x: position.x, y: position.y, width: 1, height: 1},
      this.xAxis
    );
  }

  protected override onIsNotComplete(call: boolean) {
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
  protected override onEnd(call: boolean) {
  }

  public override start(call: boolean) {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.NUMBER_LINE_TOOL2_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.NUMBER_LINE_TOOL2_OFF);
    }
  }

  public _new(): DrawNumberLine {
    return new DrawNumberLine(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.NUMBER_LINE2;
  }
}
