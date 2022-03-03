import {MoveDraw} from "../../mode/MoveDraw";
import {Point} from "../../../../../model/Point";
import {ElementView} from "../../../../../element/ElementView";
import {TSVG} from "../../../../../TSVG";
import {Callback} from "../../../../../dataSource/Callback";
import {ImageView} from "../../../../../element/foreign/media/ImageView";

export class DrawImage extends MoveDraw {
  public src: string = "";
  protected createDrawableElement(position: Point): ElementView {
    let imageView = new ImageView(this.container, position);
    imageView.src = this.src;
    return imageView;
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
    container.call(Callback.IMAGE_TOOL_ON);
  }
  public override stop() {
    super.stop();
    this.container.call(Callback.IMAGE_TOOL_OFF);
  }

  public _new(): DrawImage {
    return new DrawImage(this.container);
  }
}
