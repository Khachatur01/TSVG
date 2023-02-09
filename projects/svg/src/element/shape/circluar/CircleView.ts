/* eslint-disable @typescript-eslint/naming-convention */
import {Rect} from '../../../model/Rect';
import {ElementCursor, ElementProperties, ElementView} from '../../ElementView';
import {Container} from '../../../Container';
import {ElementType} from '../../../dataSource/constant/ElementType';
import {CircularView} from './CircularView';
import {Cursor} from '../../../dataSource/constant/Cursor';

export class CircleCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.EDIT_NODE] = 'auto';
  }
}

export class CircleView extends CircularView {
  protected override svgElement: SVGCircleElement = document.createElementNS(ElementView.svgURI, 'circle');
  protected override _type: ElementType = ElementType.CIRCLE;

  public constructor(container: Container, properties: ElementProperties = {}, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;

    this.__setRect__(rect);

    this.setProperties(properties);
  }

  public override __updateView__(): void {
    this.setAttr({
      cx: this._rect.x + this._rect.width / 2,
      cy: this._rect.y + this._rect.height / 2,
      r: this._rect.width / 2
    });
  }

  public override get copy(): CircleView {
    const ellipse: CircleView = new CircleView(this._container, this._properties, Object.assign({}, this._rect));
    ellipse.refPoint = Object.assign({}, this.refPoint);
    ellipse.__rotate__(this._angle);

    ellipse.style.set = this.style;

    return ellipse;
  }

  public override intersectsRect(rect: Rect): boolean {
    const circleRect = this.getVisibleRect();
    const cx = circleRect.x + circleRect.width / 2;
    const cy = circleRect.y + circleRect.height / 2;
    const r = circleRect.width / 2;
    let intersects;

    const distX = Math.abs(cx - rect.x - rect.width / 2);
    const distY = Math.abs(cy - rect.y - rect.height / 2);

    if (distX > (rect.width / 2 + r)) {
      intersects = false;
    } else if (distY > (rect.height / 2 + r)) {
      intersects = false;
    } else if (distX <= (rect.width / 2)) {
      intersects = true;
    } else if (distY <= (rect.height / 2)) {
      intersects = true;
    } else {
      const dx = distX - rect.width / 2;
      const dy = distY - rect.height / 2;
      intersects = dx * dx + dy * dy <= r * r;
    }

    if (intersects) {
      const inscribedSquareSide = Math.sqrt(Math.pow(2 * r, 2) / 2);
      const inscribedSquareRect = {
        x: cx - inscribedSquareSide / 2,
        y: cy - inscribedSquareSide / 2,
        width: inscribedSquareSide,
        height: inscribedSquareSide
      };

      /* if rect is inside inscribedSquareRect, then there is no intersection */
      intersects = !ElementView.rectInRect(rect, inscribedSquareRect);
    }
    return intersects;
  }

  public override __setRect__(rect: Rect): void {

    const widthSign = rect.width < 0 ? -1 : 1;
    const heightSign = rect.height < 0 ? -1 : 1;
    rect.width = rect.height = (Math.abs(rect.width) + Math.abs(rect.height)) / 2;
    rect.width *= widthSign;
    rect.height *= heightSign;

    super.__setRect__(rect);
  }
}
