import {MoveDraw} from '../../mode/MoveDraw';
import {Point} from '../../../../../model/Point';
import {ElementView} from '../../../../../element/ElementView';
import {TextBoxView} from '../../../../../element/foreign/text/TextBoxView';
import {SVGEvent} from '../../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../../dataSource/constant/ElementType';
import {Cursor} from '../../../../../dataSource/constant/Cursor';
import {MoveDrawable} from '../../type/MoveDrawable';
import {DrawTool} from '../../DrawTool';

export class DrawTextBox extends MoveDraw {
  private overdraw = false;
  public constructor(drawTool: DrawTool) {
    super(drawTool);
    this.cursor = Cursor.DRAW_TEXT_BOX;
  }
  protected createDrawableElement(position: Point): MoveDrawable {
    const textBox = new TextBoxView(this.drawTool.container, {overEvent: true, globalStyle: true}, {x: position.x, y: position.y, width: 0, height: 0});
    textBox.__onFocus__();
    return textBox;
  }

  protected override mouseDownEvent(event: MouseEvent | TouchEvent): void {
    /* turn on text edit mode when clicking to text box element */
    if (event.target instanceof HTMLElement && event.target.parentElement instanceof SVGForeignObjectElement) {
      const targetElementId = ElementView.parseId(event.target.parentElement.id);
      const targetElement: ElementView | undefined = this.drawTool.container.getElementById(targetElementId.ownerId, targetElementId.index, true);
      /* if target element is selectable, turn on text edit mode,
       * or if it cannot be created over other text boxes - do nothing.
       * */
      if (targetElement?.selectable || !this.overdraw) {
        return; /* will focus text box for editing (if selectable) */
      }
    } else if (this.drawTool.container.focused.children.size !== 0) { /* clicked outside of text box */
      this.drawTool.container.blur();
      return;
    }
    super.mouseDownEvent(event);
  }

  protected override onIsNotComplete(call: boolean): void {
    if (!this._drawableElement) {
      return;
    }
    this._drawableElement.__setRect__({
      x: this.startPosition.x,
      y: this.startPosition.y,
      width: 200,
      height: 150
    });
  }

  protected override onEnd(call: boolean): void {
    if (call) {
      if (this._drawableElement) {
        const textBox = (this._drawableElement as TextBoxView);
        this.drawTool.container.focus(textBox, false, undefined /* set default */, false);
        textBox.content.focus();
      }
    }
  }

  public override start(call: boolean): void {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.TEXT_TOOL_ON);
    }
  }
  public override stop(call: boolean): void {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.TEXT_TOOL_OFF);
    }
  }

  public _new(): DrawTextBox {
    return new DrawTextBox(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.TEXT_BOX;
  }
}
