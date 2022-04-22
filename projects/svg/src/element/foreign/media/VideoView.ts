import {Container} from "../../../Container";
import {ForeignObjectView} from "../ForeignObjectView";
import {Point} from "../../../model/Point";
import {Size} from "../../../model/Size";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {ElementCursor} from "../../ElementView";
import {Rect} from "../../../model/Rect";
import {Cursor} from "../../../dataSource/constant/Cursor";
import {Path} from "../../../model/path/Path";

export class VideoCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.EDIT] = "auto";
  }
}

export class VideoView extends ForeignObjectView {
  protected override _type: ElementType = ElementType.VIDEO;
  private readonly source: HTMLSourceElement;
  private readonly _video: HTMLVideoElement;

  /* Model */
  private _src: string = "";
  /* Model */

  public constructor(container: Container, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, src: string, ownerId?: string, index?: number) {
    super(container, rect, ownerId, index);
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
    this.src = src;
    this.setContent(this._video.outerHTML, false);
  }

  public override get copy(): VideoView {
    return super.copy as VideoView;
  }

  public get src(): string {
    return this._src;
  }
  public set src(URI: string) {
    this.source.setAttribute("src", !URI ? "" : URI);
    this._src = URI;
  }

  public get video(): HTMLVideoElement {
    return this._video;
  }

  public override isComplete(): boolean {
    return this._rect.width > 15 && this._rect.height > 15;
  }

  public override toJSON(): any {
    let json = super.toJSON();
    json["src"] = this._src;
    json["content"] = undefined;
    return json;
  }
  public override fromJSON(json: any) {
    super.fromJSON(json);
    this.src = json.src;
  };
}
