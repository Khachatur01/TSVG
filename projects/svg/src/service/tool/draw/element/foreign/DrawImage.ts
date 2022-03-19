import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {ElementView} from "../../../../../element/ElementView";
import {Callback} from "../../../../../dataSource/constant/Callback";
import {ImageView} from "../../../../../element/foreign/media/ImageView";
import {ElementType} from "../../../../../dataSource/constant/ElementType";

export class DrawImage extends MoveDraw {
  public src: string = "";
  protected createDrawableElement(position: Point): ElementView {
    let imageView = new ImageView(this.container, position);
    imageView.src = this.src;
    return imageView;
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    this._drawableElement.setSize({
      x: this.startPos.x - 150,
      y: this.startPos.y - 100,
      width: 300,
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
      this.container.call(Callback.IMAGE_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.container.call(Callback.IMAGE_TOOL_OFF);
    }
  }

  public _new(): DrawImage {
    return new DrawImage(this.container);
  }
  public get type(): ElementType {
    return ElementType.IMAGE;
  }
}
