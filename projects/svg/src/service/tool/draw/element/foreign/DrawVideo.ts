import {MoveDrawer} from '../../mode/MoveDrawer';
import {Point} from '../../../../../model/Point';
import {ElementView} from '../../../../../element/ElementView';
import {SVGEvent} from '../../../../../dataSource/constant/SVGEvent';
import {VideoView} from '../../../../../element/foreign/media/VideoView';
import {ElementType} from '../../../../../dataSource/constant/ElementType';
import {MoveDrawable} from '../../type/MoveDrawable';

export class DrawVideo extends MoveDrawer {
  public src: string = '';
  createDrawableElement(position: Point): MoveDrawable {
    return new VideoView(this.drawTool.container, {overEvent: true, globalStyle: true}, this.src, {x: position.x, y: position.y, width: 0, height: 0});
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
    if (call) {
      this.drawTool.container.tools.selectTool.on();
      if (this._drawableElement) {
        this.drawTool.container.focus(this._drawableElement as unknown as ElementView);
      }
    }
  }

  public override start(call: boolean): void {
    super.start(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.VIDEO_TOOL_ON);
    }
  }
  public override stop(call: boolean): void {
    super.stop(call);

    if (call) {
      this.drawTool.container.__call__(SVGEvent.VIDEO_TOOL_OFF);
    }
  }

  public _new(): DrawVideo {
    return new DrawVideo(this.drawTool);
  }
  public get type(): ElementType {
    return ElementType.VIDEO;
  }
}
