import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {ElementView} from "../../../../../element/ElementView";
import {Event} from "../../../../../dataSource/constant/Event";
import {ImageView} from "../../../../../element/foreign/media/ImageView";
import {ElementType} from "../../../../../dataSource/constant/ElementType";

export class DrawImage extends MoveDraw {
  public src: string = "";
  protected createDrawableElement(position: Point): ElementView {
    return new ImageView(this.container, {x: position.x, y: position.y, width: 0, height: 0}, this.src);
  }

  protected override onIsNotComplete(call: boolean) {
    if (!this._drawableElement) return;
    this._drawableElement.__setRect__({
      x: this.startPos.x - 150,
      y: this.startPos.y - 100,
      width: 300,
      height: 200
    });
    this._drawableElement.refPoint = this._drawableElement?.center;
  }
  protected override onEnd(call: boolean) {
  }

  public override start(call: boolean) {
    super.start(call);

    if (call) {
      this.container.__call__(Event.IMAGE_TOOL_ON);
    }
  }
  public override stop(call: boolean) {
    super.stop(call);

    if (call) {
      this.container.__call__(Event.IMAGE_TOOL_OFF);
    }
  }

  public _new(): DrawImage {
    return new DrawImage(this.container);
  }
  public get type(): ElementType {
    return ElementType.IMAGE;
  }
}
