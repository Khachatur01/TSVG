import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {ElementView} from "../../../../../element/ElementView";
import {TSVG} from "../../../../../TSVG";
import {Callback} from "../../../../../dataSource/Callback";
import {VideoView} from "../../../../../element/foreign/media/VideoView";

export class DrawVideo extends MoveDraw {
  public src: string = "";
  createDrawableElement(position: Point): ElementView {
    let videoView = new VideoView(this.container, position);
    videoView.src = this.src;
    return videoView;
  }

  protected override onIsNotComplete() {
    if (!this.drawableElement) return;
    this.drawableElement.setSize({
      x: this.startPos.x - 150,
      y: this.startPos.y - 100,
      width: 300,
      height: 200
    }, null);
    this.drawableElement.refPoint = this.drawableElement?.center;
  }
  protected override onEnd() {
    this.container.selectTool.on();
    if (this.drawableElement)
      this.container.focus(this.drawableElement);
  }

  public override start(container: TSVG) {
    super.start(container);
    container.call(Callback.VIDEO_TOOL_ON);
  }
  public override stop() {
    super.stop();
    this.container.call(Callback.VIDEO_TOOL_OFF);
  }

  public _new(): DrawVideo {
    return new DrawVideo(this.container);
  }
}
