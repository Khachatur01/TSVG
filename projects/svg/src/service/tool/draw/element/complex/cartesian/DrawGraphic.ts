import {Point} from "../../../../../../model/Point";
import {MoveDraw} from "../../../mode/MoveDraw";
import {ElementType} from "../../../../../../dataSource/constant/ElementType";
import {Event} from "../../../../../../dataSource/constant/Event";
import {MoveDrawable} from "../../../type/MoveDrawable";
import {GraphicView} from "../../../../../../element/complex/cartesian/GraphicView";

export class DrawGraphic extends MoveDraw {
  public f: Function = (x: number) => x;
  protected createDrawableElement(position: Point): MoveDrawable {
    return new GraphicView(
      this.container,
      {overEvent: true, globalStyle: true},
      {x: position.x, y: position.y, width: 1, height: 1},
      {x: 1, y: 1},
      this.f
    );
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    (this._drawableElement as unknown as MoveDrawable).__drawSize__({
      x: this.startPosition.x - 150,
      y: this.startPosition.y - 150,
      width: 300,
      height: 300
    });
    this._drawableElement.refPoint = this._drawableElement.center;
  }
  protected override onEnd(call: boolean) {
  }

  public override start(call: boolean) {
    super.start(call);

    if (call) {
      this.container.__call__(Event.GRAPHIC_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.container.__call__(Event.GRAPHIC_TOOL_OFF);
    }
  }

  public _new(): DrawGraphic {
    return new DrawGraphic(this.container);
  }
  public get type(): ElementType {
    return ElementType.GRAPHIC;
  }
}
