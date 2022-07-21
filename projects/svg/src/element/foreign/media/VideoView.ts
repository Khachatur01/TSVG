import {Container} from "../../../Container";
import {ForeignObjectView} from "../ForeignObjectView";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {ElementCursor, ElementProperties} from "../../ElementView";
import {Rect} from "../../../model/Rect";
import {Cursor} from "../../../dataSource/constant/Cursor";

export class VideoCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.EDIT_NODE] = "auto";
  }
}

export class VideoView extends ForeignObjectView {
  protected override _type: ElementType = ElementType.VIDEO;
  private readonly source: HTMLSourceElement;
  protected override readonly _content: HTMLVideoElement;

  /* Model */
  private _src: string = "";
  /* Model */

  public constructor(container: Container, properties: ElementProperties = {}, src: string, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, {}, rect, ownerId, index);
    this._content = document.createElement("video");
    this._content.style.width = "calc(100% - 20px)";
    this._content.style.height = "calc(100% - 20px)";
    this._content.style.marginLeft = "10px";
    this._content.style.marginTop = "10px";
    this._content.style.height = "calc(100% - 20px)";
    this._content.style.cursor = "pointer";
    this._content.controls = true;
    this.source = document.createElement("source");
    this._content.appendChild(this.source);
    this.src = src;
    this.svgElement.innerHTML = "";
    this.svgElement.appendChild(this._content);

    this.setProperties(properties);
  }

  public get src(): string {
    return this._src;
  }
  public set src(URI: string) {
    this.source.setAttribute("src", !URI ? "" : URI);
    this._src = URI;
  }

  public get video(): HTMLVideoElement {
    return this._content;
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
