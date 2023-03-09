import {MoveDrawer} from '../../mode/MoveDrawer';
import {Point} from '../../../../../model/Point';
import {ForeignObjectView} from '../../../../../element/foreign/ForeignObjectView';
import {SVGEvent} from '../../../../../dataSource/constant/SVGEvent';
import {ElementType} from '../../../../../dataSource/constant/ElementType';
import {MoveDrawable} from '../../type/MoveDrawable';

export class DrawForeignObject extends MoveDrawer {
  public content: string = '';
  public contentEditable: boolean = true;

  protected createDrawableElement(position: Point): MoveDrawable {
    const videoView: ForeignObjectView = new ForeignObjectView(this.drawTool.container, {overEvent: true, globalStyle: true, contentEditable: this.contentEditable}, {x: position.x, y: position.y, width: 0, height: 0});
    videoView.setContent(this.content);
    return videoView;
  }

  protected override onIsNotComplete(call: boolean): void {
    if (!this._drawableElement) {
      return;
    }
    this._drawableElement.__setRect__({
      x: this.startPosition.x,
      y: this.startPosition.y,
      width: 600,
      height: 200
    });
    this._drawableElement.refPoint = this._drawableElement?.center;
  }
  protected override onEnd(call: boolean): void {}

  public override start(call: boolean): void {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.ASSET_TOOL_ON);
    }
  }
  public override stop(call: boolean): void {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.ASSET_TOOL_OFF);
    }
  }

  public _new(): DrawForeignObject {
    return new DrawForeignObject(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.FOREIGN_OBJECT;
  }
}
