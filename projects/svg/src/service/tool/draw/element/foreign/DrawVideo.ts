import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {ElementView} from "../../../../../element/ElementView";
import {Callback} from "../../../../../dataSource/constant/Callback";
import {VideoView} from "../../../../../element/foreign/media/VideoView";
import {ElementType} from "../../../../../dataSource/constant/ElementType";

export class DrawVideo extends MoveDraw {
  public src: string = "";
  createDrawableElement(position: Point): ElementView {
    return new VideoView(this.container, {x: position.x, y: position.y, width: 0, height: 0}, this.src);
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    this._drawableElement.setRect({
      x: this.startPos.x - 150,
      y: this.startPos.y - 100,
      width: 300,
      height: 200
    });
    this._drawableElement.refPoint = this._drawableElement?.center;
  }
  protected override onEnd(call: boolean) {
    if (call) {
      this.container.selectTool.on();
      if (this._drawableElement)
        this.container.focus(this._drawableElement);
    }
  }

  public override start(call: boolean) {
    super.start(call);

    if (call) {
      this.container.call(Callback.VIDEO_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.container.call(Callback.VIDEO_TOOL_OFF);
    }
  }

  public _new(): DrawVideo {
    return new DrawVideo(this.container);
  }
  public get type(): ElementType {
    return ElementType.VIDEO;
  }
}
