import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {ElementView} from "../../../../../element/ElementView";
import {ForeignObjectView} from "../../../../../element/foreign/ForeignObjectView";
import {TSVG} from "../../../../../TSVG";
import {Callback} from "../../../../../dataSource/Callback";

export class DrawAsset extends MoveDraw {
  public content: HTMLDivElement = document.createElement("div");
  protected createDrawableElement(position: Point): ElementView {
    let videoView = new ForeignObjectView(this.container, position);
    videoView.setContent(this.content);
    return videoView;
  }

  protected override onIsNotComplete() {
    if (!this.drawableElement) return;
    this.drawableElement.setSize({
      x: this.startPos.x - 300,
      y: this.startPos.y - 100,
      width: 600,
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
    container.call(Callback.ASSET_TOOL_ON);
  }
  public override stop() {
    super.stop();
    this.container.call(Callback.ASSET_TOOL_OFF);
  }

  public _new(): DrawAsset {
    return new DrawAsset(this.container);
  }
}
