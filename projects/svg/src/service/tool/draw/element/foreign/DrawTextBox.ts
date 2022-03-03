import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {ElementView} from "../../../../../element/ElementView";
import {TextBoxView} from "../../../../../element/foreign/text/TextBoxView";
import {TSVG} from "../../../../../TSVG";
import {Callback} from "../../../../../dataSource/Callback";

export class DrawTextBox extends MoveDraw {
  protected createDrawableElement(position: Point): ElementView {
    let textBox = new TextBoxView(this.container, position);
    textBox.SVG.style.outline = textBox.outline;
    return textBox;
  }

  protected override onIsNotComplete() {
    if (!this.drawableElement) return;
    this.drawableElement.setSize({
      x: this.startPos.x,
      y: this.startPos.y,
      width: 200,
      height: 100
    }, null);
    this.drawableElement.refPoint = this.drawableElement?.center;
  }
  protected override onEnd() {
    this.container.editTool.on();
    let textBox = (this.drawableElement as TextBoxView);
    textBox.content?.focus();
    textBox.onFocus();
  }

  public override start(container: TSVG) {
    super.start(container);
    container.call(Callback.TEXT_TOOL_ON);
  }
  public override stop() {
    super.stop();
    this.container.call(Callback.TEXT_TOOL_OFF);
  }

  public _new(): DrawTextBox {
    return new DrawTextBox(this.container);
  }
}
