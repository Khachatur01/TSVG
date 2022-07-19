import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {ElementView} from "../../../../../element/ElementView";
import {Event} from "../../../../../dataSource/constant/Event";
import {VideoView} from "../../../../../element/foreign/media/VideoView";
import {ElementType} from "../../../../../dataSource/constant/ElementType";
import {MoveDrawable} from "../../type/MoveDrawable";

export class DrawVideo extends MoveDraw {
  public src: string = "";
  createDrawableElement(position: Point): MoveDrawable {
    return new VideoView(this.container, {overEvent: true, globalStyle: true}, this.src, {x: position.x, y: position.y, width: 0, height: 0});
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    this._drawableElement.__setRect__({
      x: this.startPosition.x - 150,
      y: this.startPosition.y - 100,
      width: 300,
      height: 200
    });
    this._drawableElement.refPoint = this._drawableElement?.center;
  }
  protected override onEnd(call: boolean) {
    if (call) {
      this.container.tools.selectTool.on();
      if (this._drawableElement)
        this.container.focus(this._drawableElement as unknown as ElementView);
    }
  }

  public override start(call: boolean) {
    super.start(call);

    if (call) {
      this.container.__call__(Event.VIDEO_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.container.__call__(Event.VIDEO_TOOL_OFF);
    }
  }

  public _new(): DrawVideo {
    return new DrawVideo(this.container);
  }
  public get type(): ElementType {
    return ElementType.VIDEO;
  }
}
