import {MoveDraw} from '../../mode/MoveDraw';
import {Point} from '../../../../../model/Point';
import {SVGEvent} from '../../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../../dataSource/constant/ElementType';
import {Cursor} from '../../../../../dataSource/constant/Cursor';
import {TextView} from '../../../../../element/foreign/text/TextView';
import {MoveDrawable} from '../../type/MoveDrawable';
import {DrawTool} from '../../DrawTool';

export class DrawText extends MoveDraw {
  public text = '';
  public constructor(drawTool: DrawTool) {
    super(drawTool);
    this.cursor = Cursor.DRAW_TEXT_BOX;
  }
  protected createDrawableElement(position: Point): MoveDrawable {
    const text = new TextView(this.drawTool.container, {overEvent: true, globalStyle: true}, {x: position.x, y: position.y, width: 0, height: 0}, this.text);
    text.__onFocus__();
    return text;
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) {
      return;
    }
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
      this.drawTool.container.__call__(SVGEvent.TEXT_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.TEXT_TOOL_OFF);
    }
  }

  public _new(): DrawText {
    return new DrawText(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.TEXT_BOX;
  }
}
