import {Point} from "../../../../../../model/Point";
import {MoveDraw} from "../../../mode/MoveDraw";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";
import {ElementView} from "../../../../../../element/ElementView";
import {Event} from "../../../../../../dataSource/constant/Event";
import {NumberLineView} from "../../../../../../element/complex/cartesian/NumberLineView";
import {MoveDrawable} from "../../../type/MoveDrawable";

export class DrawNumberLine extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    return new NumberLineView(this.container, {overEvent: true, globalStyle: false}, {
      x: position.x,
      y: position.y,
      width: 1,
      height: 1
    });
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    (this._drawableElement as unknown as MoveDrawable).__drawSize__({
      x: this.startPosition.x - 150,
      y: this.startPosition.y - 25,
      width: 300,
      height: 50
    });
    this._drawableElement.refPoint = this._drawableElement.center;
  }
  protected override onEnd(call: boolean) {
  }

  public override start(call: boolean) {
    super.start(call);

    if (call) {
      this.container.__call__(Event.NUMBER_LINE_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.container.__call__(Event.NUMBER_LINE_TOOL_OFF);
    }
  }

  public _new(): DrawNumberLine {
    return new DrawNumberLine(this.container);
  }
  public get type(): ElementType {
    return ElementType.NUMBER_LINE;
  }
}
