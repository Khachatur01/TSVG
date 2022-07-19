import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {ElementView} from "../../../../../element/ElementView";
import {Event} from "../../../../../dataSource/constant/Event";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {Container} from "../../../../../Container";
import {Cursor} from "../../../../../dataSource/constant/Cursor";
import {TextView} from "../../../../../element/foreign/text/TextView";

export class DrawText extends MoveDraw {
  public text: string = "";
  public constructor(container: Container) {
    super(container);
    this.cursor = Cursor.DRAW_TEXT_BOX;
  }
  protected createDrawableElement(position: Point): ElementView {
    let text = new TextView(this.container, {overEvent: true, globalStyle: true}, {x: position.x, y: position.y, width: 0, height: 0}, this.text);
    text.__onFocus__();
    return text;
  }

  protected override turnOnToolAfterDrawing(): void {}

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    this._drawableElement.__setRect__({
      x: this.startPosition.x,
      y: this.startPosition.y,
      width: 200,
      height: 150
    });
    this._drawableElement.refPoint = this._drawableElement?.center;
  }

  public override start(call: boolean) {
    super.start(call);

    if (call) {
      this.container.__call__(Event.TEXT_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.container.__call__(Event.TEXT_TOOL_OFF);
    }
  }

  public _new(): DrawText {
    return new DrawText(this.container);
  }
  public get type(): ElementType {
    return ElementType.TEXT_BOX;
  }
}
