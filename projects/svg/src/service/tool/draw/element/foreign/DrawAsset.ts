import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {ElementView} from "../../../../../element/ElementView";
import {ForeignObjectView} from "../../../../../element/foreign/ForeignObjectView";
import {Callback} from "../../../../../dataSource/constant/Callback";
import {ElementType} from "../../../../../dataSource/constant/ElementType";

export class DrawAsset extends MoveDraw {
  public content: HTMLDivElement = document.createElement("div");

  protected createDrawableElement(position: Point): ElementView {
    let videoView = new ForeignObjectView(this.container, position);
    videoView.setContent(this.content);
    return videoView;
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    this._drawableElement.setSize({
      x: this.startPos.x - 300,
      y: this.startPos.y - 100,
      width: 600,
      height: 200
    }, null);
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
      this.container.call(Callback.ASSET_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.container.call(Callback.ASSET_TOOL_OFF);
    }
  }

  public _new(): DrawAsset {
    return new DrawAsset(this.container);
  }
  public get type(): ElementType {
    return ElementType.FOREIGN_OBJECT;
  }
}
