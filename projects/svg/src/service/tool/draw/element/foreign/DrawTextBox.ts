import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {ElementView} from "../../../../../element/ElementView";
import {TextBoxView} from "../../../../../element/foreign/text/TextBoxView";
import {Event} from "../../../../../dataSource/constant/Event";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {Container} from "../../../../../Container";
import {Cursor} from "../../../../../dataSource/constant/Cursor";
import {MoveDrawable} from "../../type/MoveDrawable";

export class DrawTextBox extends MoveDraw {
  public constructor(container: Container) {
    super(container);
    this.cursor = Cursor.DRAW_TEXT_BOX;
  }
  protected createDrawableElement(position: Point): MoveDrawable {
    let textBox = new TextBoxView(this.container, {overEvent: true, globalStyle: true}, {x: position.x, y: position.y, width: 0, height: 0});
    textBox.__onFocus__(true);
    return textBox;
  }

  protected override turnOnToolAfterDrawing(): void {}

  protected override drawStart(event: MouseEvent | TouchEvent) {
    /* turn on text edit mode when clicking to text box element */
    if (event.target instanceof HTMLElement && event.target.parentElement instanceof SVGForeignObjectElement) {
      let targetElementId = ElementView.parseId(event.target.parentElement.id);
      let targetElement: ElementView | undefined = this.container.getElementById(targetElementId.ownerId, targetElementId.index, true);
      if (!targetElement || targetElement.selectable) {
        return;
      }
    } else if (this.container.focused.children.size !== 0) { /* turn on default tool when clicking outside of text box */
      super.turnOnToolAfterDrawing();
      return;
    }
    super.drawStart(event);
  }

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

  protected override onEnd(call: boolean) {
    if (call) {
      if (this._drawableElement) {
        let textBox = (this._drawableElement as TextBoxView);
        this.container.focus(textBox, false, undefined /* set default */, false);
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
