import {ElementCursor, ElementStyle, ElementView} from "../ElementView";
import {Point} from "../../model/Point";
import {Rect} from "../../model/Rect";
import {PathView} from "../shape/PathView";
import {Container} from "../../Container";
import {ElementType} from "../../dataSource/constant/ElementType";

export class GroupCursor extends ElementCursor {}

export class GroupStyle extends ElementStyle {
  protected override element: GroupView;

  public constructor(element: GroupView) {
    super(element);
    this.element = element;
  }

  public override get strokeWidth(): string {
    return super.strokeWidth;
  }
  public override set strokeWidth(width: string) {
    super.strokeWidth = width;
    this.element.elements.forEach((child: ElementView) => {
      child.style.strokeWidth = width;
    });
    this.element.setAttr({"stroke-width": width});
  }

  public override get strokeDashArray(): string {
    return super.strokeDashArray;
  }
  public override set strokeDashArray(array: string) {
    super.strokeDashArray = array;
    this.element.elements.forEach((child: ElementView) => {
      child.style.strokeDashArray = array;
    });
    this.element.setAttr({"stroke-dasharray": array});
  }

  public override get strokeColor(): string {
    return super.strokeColor;
  }
  public override set strokeColor(color: string) {
    super.strokeColor = color;
    this.element.elements.forEach((child: ElementView) => {
      child.style.strokeColor = color;
    });
    this.element.setAttr({"stroke": color});
  }

  public override get fillColor(): string {
    return super.fillColor;
  }
  public override set fillColor(color: string) {
    super.fillColor = color;
    this.element.elements.forEach((child: ElementView) => {
      child.style.fillColor = color;
    });
    this.element.setAttr({"fill": color});
  }

  public override get fontSize(): string {
    return super.fontSize;
  }
  public override set fontSize(size: string) {
    super.fontSize = size;
    this.element.elements.forEach((child: ElementView) => {
      child.style.fontSize = size;
    });
    this.element.HTML.style.fontSize = size + "px";
  }

  public override get fontColor(): string {
    return super.fontColor;
  }
  public override set fontColor(color: string) {
    super.fontColor = color;
    this.element.elements.forEach((child: ElementView) => {
      child.style.fontColor = color;
    });
    this.element.HTML.style.color = color;
  }

  public override get backgroundColor(): string {
    return super.backgroundColor;
  }
  public override set backgroundColor(color: string)  {
    super.backgroundColor = color;
    this.element.elements.forEach((child: ElementView) => {
      child.style.backgroundColor = color;
    });
    this.element.HTML.style.backgroundColor = color;
  }
}

export class GroupView extends ElementView {
  protected override svgElement: SVGElement = document.createElementNS(ElementView.svgURI, "g");
  protected override _type: ElementType = ElementType.GROUP;

  /* Model */
  private _elements: Set<ElementView> = new Set<ElementView>()
  /* Model */

  public constructor(container: Container, ownerId?: string, index?: number) {
    super(container, ownerId, index);
    this.svgElement.id = this.id;
  }

  public get copy(): GroupView {
    let group: GroupView = new GroupView(this._container);
    this._elements.forEach((element: ElementView) => {
      let copy = element.copy;
      copy.group = group;
      group.addElement(copy);
    });

    group.refPoint = Object.assign({}, this.refPoint);
    group._angle = (this._angle);

    group.style.set = this.style;

    return group;
  }

  public getElementById(ownerId: string, index: number): ElementView | undefined {
    for (let element of this._elements) {
      if (element instanceof GroupView) {
        return element.getElementById(ownerId, index);
      } else if (element.ownerId === ownerId && element.index === index) {
        return element;
      }
    }
    return undefined;
  }
  public get elements(): Set<ElementView> {
    return this._elements;
  }
  public addElement(element: ElementView) {
    this._elements.add(element);
    this.svgElement.appendChild(element.SVG);
    this.recalculateRect();
  }
  public removeElement(element: ElementView) {
    this._elements.delete(element);
    this.svgElement.removeChild(element.SVG);
    this.recalculateRect();
  }
  public setElements(elements: Set<ElementView>) {
    this._elements = elements;
    this.svgElement.innerHTML = "";
    elements.forEach((element: ElementView) => {
      this.svgElement.appendChild(element.SVG);
    });
    this.recalculateRect();
  }
  public removeElements() {
    this._elements.clear();
    this.svgElement.innerHTML = "";

    this._rect.width = 0;
    this._rect.height = 0;
  }

  public override get points(): Point[] {
    let points: Point[] = [];
    this._elements.forEach((element: ElementView) => {
      element.points.forEach((point: Point) => {
        points.push(Object.assign({}, point));
      });
    });
    return points;
  }
  public override get visiblePoints(): Point[] {
    let points: Point[] = [];
    this._elements.forEach((element: ElementView) => {
      element.visiblePoints.forEach((point: Point) => {
        points.push(Object.assign({}, point));
      });
    });
    return points;
  }
  public override __correct__(refPoint: Point, lastRefPoint: Point) {
    this._elements.forEach((child: ElementView) => {
      child.__correct__(refPoint, lastRefPoint)
    });

    let correctionDelta = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    this._rect.x += correctionDelta.x;
    this._rect.y += correctionDelta.y;
  }

  public override __translate__(delta: Point) {
    this.svgElement.style.transform =
      "translate(" + delta.x + "px, " + delta.y + "px)";
  }
  public __drag__(delta: Point): void {
    this._elements.forEach((element: ElementView) => {
      element.__drag__(delta);
    });

    this._rect.x += delta.x;
    this._rect.y += delta.y;
  }

  public __setRect__(rect: Rect, delta?: Point): void {
  }

  protected recalculateRect() {
    let minX, minY;
    let maxX, maxY;

    let children = Array.from(this._elements);
    if (children.length < 1)
      return

    let firstChild = children[0];

    let firstBoundingRect = firstChild.getVisibleRect();

    minX = firstBoundingRect.x;
    minY = firstBoundingRect.y;
    maxX = firstBoundingRect.width + minX;
    maxY = firstBoundingRect.height + minY;

    for (let i = 1; i < children.length; i++) {
      let boundingRect = children[i].getVisibleRect();
      if (boundingRect.x < minX)
        minX = boundingRect.x;
      if (boundingRect.y < minY)
        minY = boundingRect.y;
      if (boundingRect.width + boundingRect.x > maxX)
        maxX = boundingRect.width + boundingRect.x;
      if (boundingRect.height + boundingRect.y > maxY)
        maxY = boundingRect.height + boundingRect.y;
    }

    this._rect = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  public override getAttr(attribute: string): string {
    let [firstElement] = this._elements;
    let value = firstElement.SVG.getAttribute(attribute);
    if (!value)
      return "0";
    return value;
  }
  public override setAttr(attributes: object): void {
    for (let element of this._elements)
      for (const [key, value] of Object.entries(attributes))
        if (key && value)
          element.SVG.setAttribute(key, "" + value);
  }

  public override get refPoint(): Point {
    return super.refPoint;
  }
  public override set refPoint(point: Point) {
    this._refPoint = point;
    this._elements.forEach(child => child.refPoint = point);
  }

  public override __rotate__(angle: number) {
    this._angle = angle;
    this._elements.forEach(child =>
      child.__rotate__((angle + child.__lastAngle__ - this.___lastAngle__) % 360)
    );
  }

  public override __fixRect__(): void {
    super.__fixRect__();
    this._elements.forEach(child => child.__fixRect__());
  }
  public override __fixAngle__(): void {
    super.__fixAngle__();
    this._elements.forEach(child => child.__fixAngle__());
  }
  public override __onFocus__() {
  }
  public override __onBlur__() {
  }

  public toPath(): PathView {
    return new PathView(this._container);
  }

  public isComplete(): boolean {
    return true;
  }

  protected __updateView__(): void {
  }

  public override toJSON(): any {
    let json =  super.toJSON();
    json["elements"] = [];
    for (let element of this._elements) {
      json["elements"].push(element.toJSON());
    }
    return json;
  }
  public override fromJSON(json: any) {
    super.fromJSON(json);
    this.removeElements();
    json.elements.forEach((element: any) => {
      this.addElement(element);
    });
  };
}
