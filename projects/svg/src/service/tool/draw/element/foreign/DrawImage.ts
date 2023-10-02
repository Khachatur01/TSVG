import {MoveDrawer} from '../../mode/MoveDrawer';
import {Point} from '../../../../../model/Point';
import {SVGEvent} from '../../../../../dataSource/constant/SVGEvent';
import {ImageView} from '../../../../../element/foreign/media/ImageView';
import {ElementType} from '../../../../../dataSource/constant/ElementType';
import {MoveDrawable} from '../../type/MoveDrawable';

export class DrawImage extends MoveDrawer {
  public src: string = '';
  public proportionalResizable: boolean = false;

  protected createDrawableElement(position: Point): MoveDrawable {
    return new ImageView(this.drawTool.container, {overEvent: true, globalStyle: true, proportionalResizable: this.proportionalResizable}, this.src, {x: position.x, y: position.y, width: 0, height: 0});
  }

  protected override onIsNotComplete(call: boolean): void {
    if (!this._drawableElement) {
      return;
    }
    this._drawableElement.__setRect__({
      x: this.startPosition.x - 150,
      y: this.startPosition.y - 100,
      width: 300,
      height: 200
    });
    this._drawableElement.refPoint = this._drawableElement?.center;
  }
  protected override onEnd(call: boolean): void {
  }

  public override start(call: boolean): void {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.IMAGE_TOOL_ON);
    }
  }
  public override stop(call: boolean): void {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.IMAGE_TOOL_OFF);
    }
  }

  public _new(): DrawImage {
    return new DrawImage(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.IMAGE;
  }
}
