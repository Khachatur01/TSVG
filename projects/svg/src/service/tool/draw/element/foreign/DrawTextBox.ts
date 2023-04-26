import {MoveDrawer} from '../../mode/MoveDrawer';
import {Point} from '../../../../../model/Point';
import {ElementView} from '../../../../../element/ElementView';
import {TextBoxView} from '../../../../../element/foreign/text/TextBoxView';
import {SVGEvent} from '../../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../../dataSource/constant/ElementType';
import {Cursor} from '../../../../../dataSource/constant/Cursor';
import {MoveDrawable} from '../../type/MoveDrawable';
import {DrawTool} from '../../DrawTool';
import {ForeignObjectView} from '../../../../../element/foreign/ForeignObjectView';

export class DrawTextBox extends MoveDrawer {
  private _isInEditMode: boolean = false;
  private overdraw: boolean = false;

  public constructor(drawTool: DrawTool) {
    super(drawTool);
    this.cursor = Cursor.DRAW_TEXT_BOX;
  }
  protected createDrawableElement(position: Point): MoveDrawable {
    const textBox: TextBoxView = new TextBoxView(this.drawTool.container, {overEvent: true, globalStyle: true}, {x: position.x, y: position.y, width: 0, height: 0});
    textBox.__onFocus__();
    return textBox;
  }

  protected override mouseDownEvent(event: MouseEvent | TouchEvent): void {
    this.drawTool.container.elements.forEach((element: ElementView): void => {
      if (element instanceof ForeignObjectView) {
        element.content.blur();
      }
      element.__onBlur__();
    });

    /* turn on text edit mode when clicking to text box element */
    if (event.target instanceof HTMLElement && event.target.parentElement instanceof SVGForeignObjectElement) {
      const targetElementId: {index: number; ownerId: string} | null = ElementView.parseId(event.target.parentElement.id);
      const targetElement: ElementView | null = targetElementId && this.drawTool.container.getElementById(targetElementId.ownerId, targetElementId.index, true);
      /*
       * if target element is selectable, or it cannot be created over other text boxes, turn on text edit mode,
       * */
      if (targetElement instanceof ForeignObjectView && targetElement.selectable) {
        this._isInEditMode = true;
        targetElement.content.focus();
        targetElement.__onFocus__();
        return;
      } else if (!this.overdraw) {
        return;
      } /* else will be called super.mousedownEvent(event) */
    } else if (this._isInEditMode) { /* clicked outside of text box */
      this._isInEditMode = false;
      return;
    }
    super.mouseDownEvent(event);
  }

  get isInEditMode(): boolean {
    return this._isInEditMode;
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
        const textBox: TextBoxView = (this._drawableElement as TextBoxView);
        this.drawTool.container.focus(textBox, false, undefined /* set default */, false);
        textBox.content.focus();
        this._isInEditMode = true;
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
    this._isInEditMode = false;

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
