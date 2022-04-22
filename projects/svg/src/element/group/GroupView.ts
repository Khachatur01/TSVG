import {ElementCursor, ElementView} from "../ElementView";
import {Point} from "../../model/Point";
import {Rect} from "../../model/Rect";
import {PathView} from "../shape/PathView";
import {Container} from "../../Container";
import {ElementType} from "../../dataSource/constant/ElementType";

export class GroupCursor extends ElementCursor {}

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

    group.__refPoint__ = Object.assign({}, this.__refPoint__);
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

  public override get __refPoint__(): Point {
    return super.__refPoint__;
  }
  public override set __refPoint__(point: Point) {
    this.___refPoint__ = point;
    this._elements.forEach(child => child.__refPoint__ = point);
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
