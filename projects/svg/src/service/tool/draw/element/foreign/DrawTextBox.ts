import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {ElementView} from "../../../../../element/ElementView";
import {TextBoxView} from "../../../../../element/foreign/text/TextBoxView";
import {Callback} from "../../../../../dataSource/constant/Callback";
import {ElementType} from "../../../../../dataSource/constant/ElementType";

export class DrawTextBox extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    let textBox = new TextBoxView(this.container, {x: position.x, y: position.y, width: 0, height: 0});
    textBox.onFocus(true);
    return textBox;
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    this._drawableElement.setRect({
      x: this.startPos.x,
      y: this.startPos.y,
      width: 200,
      height: 100
    });
    this._drawableElement.refPoint = this._drawableElement?.center;
  }
  protected override onEnd(call: boolean) {
    if (call) {
      this.container.editTool.on();
      if (this._drawableElement) {
        this.container.focus(this._drawableElement, false, false);
        this.container.editTool.editableElement = this._drawableElement as TextBoxView;
        let textBox = (this._drawableElement as TextBoxView);
        textBox.content?.focus();
        textBox.onFocus(true);
      }
    }
  }

  public override start(call: boolean) {
    super.start(call);

    if (call) {
      this.container.call(Callback.TEXT_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.container.call(Callback.TEXT_TOOL_OFF);
    }
  }

  public _new(): DrawTextBox {
    return new DrawTextBox(this.container);
  }
  public get type(): ElementType {
    return ElementType.TEXT_BOX;
  }
}
