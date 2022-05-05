import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {ElementView} from "../../../../../element/ElementView";
import {TextBoxView} from "../../../../../element/foreign/text/TextBoxView";
import {Event} from "../../../../../dataSource/constant/Event";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {ForeignObjectView} from "../../../../../element/foreign/ForeignObjectView";
import {Container} from "../../../../../Container";

export class DrawTextBox extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    let textBox = new TextBoxView(this.container, {x: position.x, y: position.y, width: 0, height: 0});
    textBox.__onFocus__(true);
    return textBox;
  }

  protected override turnOnToolAfterDrawing(): void {}

  protected override drawStart(event: MouseEvent | TouchEvent) {
    if (event.target instanceof HTMLElement) {
      if (event.target.parentElement instanceof SVGForeignObjectElement) {
        console.log("don't draw")
        return;
      }
    }
    super.drawStart(event);
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    this._drawableElement.__setRect__({
      x: this.startPos.x,
      y: this.startPos.y,
      width: 200,
      height: 100
    });
    this._drawableElement.refPoint = this._drawableElement?.center;
  }

  protected override onEnd(call: boolean) {
    if (call) {
      if (this._drawableElement) {
        let textBox = (this._drawableElement as TextBoxView);
        this.container.focus(textBox, false, undefined, false);
        textBox.content.focus();
        textBox.__onFocus__(true);
      }
    }
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

  public _new(): DrawTextBox {
    return new DrawTextBox(this.container);
  }
  public get type(): ElementType {
    return ElementType.TEXT_BOX;
  }
}
