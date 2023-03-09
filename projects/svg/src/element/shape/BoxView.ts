import {ElementCursor, ElementProperties, ElementView} from '../ElementView';
import {Point} from '../../model/Point';
import {Rect} from '../../model/Rect';
import {Container} from '../../Container';
import {PathView} from './path/PathView';
import {ShapeView} from '../type/ShapeView';
import {ElementType} from '../../dataSource/constant/ElementType';

export class BoxCursor extends ElementCursor {}

export interface BoxProperties extends ElementProperties {}

export class BoxView extends ShapeView {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, 'rect');
  protected override _type: ElementType = ElementType.BOX;

  public constructor(container: Container, properties: BoxProperties = {}, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this._rect = rect;
    this.__updateView__();

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

  public override __correct__(refPoint: Point, lastRefPoint: Point): void {}
  public __drag__(delta: Point): void {
    this._rect.x = this._lastRect.x + delta.x;
    this._rect.y = this._lastRect.y + delta.y;
    this.__updateView__();
  }

  public override isComplete(): boolean {
    return this._rect.width !== 0 && this._rect.height !== 0;
  }

  public override toPath(): PathView {
    return new PathView(this._container, this._properties); /* TODO */
  }
}
