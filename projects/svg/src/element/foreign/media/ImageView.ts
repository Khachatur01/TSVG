import {ElementCursor, ElementProperties, ElementView} from '../../ElementView';
import {PathView} from '../../shape/path/PathView';
import {Size} from '../../../model/Size';
import {Rect} from '../../../model/Rect';
import {Point} from '../../../model/Point';
import {Container} from '../../../Container';
import {ForeignView} from '../../type/ForeignView';
import {MoveDrawable} from '../../../service/tool/draw/type/MoveDrawable';
import {ElementType} from '../../../dataSource/constant/ElementType';

export class ImageCursor extends ElementCursor {
  constructor() {
    super();
  }
}

export interface ImageProperties extends ElementProperties {}

export class ImageView extends ForeignView implements MoveDrawable {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, 'image');
  protected override _type: ElementType = ElementType.IMAGE;

  /* Model */
  private _src: string = '';
  /* Model */

  public constructor(container: Container, properties: ImageProperties = {}, src: string, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.svgElement.ondragstart = () => false;

    this.__setRect__(rect);
    this.src = src;

    this.setAttr({
      preserveAspectRatio: 'none'
    });

    this.setProperties(properties);
  }

  public __updateView__(): void {
    this.setAttr({
      x: this._rect.x,
      y: this._rect.y,
      width: this._rect.width,
      height: this._rect.height
    });

  }

  public __drag__(delta: Point): void {
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;
    this.__updateView__();
  }

  public get size(): Size {
    return {
      width: parseInt(this.getAttr('width')),
      height: parseInt(this.getAttr('height'))
    };
  }
  public __drawSize__(rect: Rect): void {
    this.__setRect__(rect);
  }

  public get src(): string {
    return this._src;
  }
  public set src(URI: string) {
    this.setAttr({href: URI});
    this._src = URI;
  }

  public isComplete(): boolean {
    const size: Size = this.size;
    return size.width > 0 && size.height > 0;
  }

  public toPath(): PathView {
    return new PathView(this._container, this._properties);
  }

  public override toJSON(): any {
    const json: any = super.toJSON();
    json.src = this._src;
    json.content = undefined;
    return json;
  }
  public override fromJSON(json: any): void {
    super.fromJSON(json);
    this.src = json.src;
  };
}
