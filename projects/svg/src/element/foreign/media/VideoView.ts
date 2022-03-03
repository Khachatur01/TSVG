import {TSVG} from "../../../TSVG";
import {ForeignObjectView} from "../ForeignObjectView";
import {Point} from "../../../model/Point";
import {Size} from "../../../model/Size";

export class VideoView extends ForeignObjectView {
  private readonly source: HTMLSourceElement;
  private readonly _video: HTMLVideoElement;

  public constructor(container: TSVG, position: Point = {x: 0, y: 0}, size: Size = {width: 0, height: 0}) {
    super(container, position, size);
    this._video = document.createElement("video");
    this._video.style.width = "calc(100% - 20px)";
    this._video.style.height = "calc(100% - 20px)";
    this._video.style.marginLeft = "10px";
    this._video.style.marginTop = "10px";
    this._video.style.height = "calc(100% - 20px)";
    this._video.style.cursor = "pointer";
    this._video.controls = true;
    this.source = document.createElement("source");
    this._video.appendChild(this.source);
    this.setContent(this._video, false);
  }

  public override get copy(): VideoView {
    return super.copy as VideoView;
  }

  public set src(URI: string | null) {
    this.source.setAttribute("src", !URI ? "" : URI);
  }
  public get src(): string | null {
    return this.source.getAttribute("src");
  }

  public get video(): HTMLVideoElement {
    return this._video;
  }

  public override isComplete(): boolean {
    let size = this.size;
    return size.width > 15 && size.height > 15;
  }
}
