import {ElementView} from "../../../element/ElementView";
import {Draggable} from "../../tool/drag/Draggable";
import {Point} from "../../../model/Point";
import {BoundingBox} from "./bound/BoundingBox";
import {TSVG} from "../../../TSVG";
import {Rect} from "../../../model/Rect";
import {Resizeable} from "../resize/Resizeable";
import {Size} from "../../../model/Size";
import {PathView} from "../../../element/shape/pointed/polyline/PathView";
import {GroupView} from "../../../element/group/GroupView";
import {Callback} from "../../../dataSource/constant/Callback";
import {Matrix} from "../../math/Matrix";

export class Focus implements Draggable, Resizeable {
  private readonly container: TSVG;
  private readonly _children: Set<ElementView> = new Set<ElementView>();
  private readonly svgGroup: SVGGElement;
  private readonly svgBounding: SVGGElement;

  private _lastPosition: Point = {x: 0, y: 0};
  private _lastSize: Size = {width: 0, height: 0};
  private _lastAngle: number = 0;

  public readonly boundingBox: BoundingBox;

  private lastCopyPosition: Point = {x: 0, y: 0};
  private elementsClipboard: Set<ElementView> = new Set<ElementView>();

  public constructor(container: TSVG) {
    this.container = container;

    this.boundingBox = new BoundingBox(this.container, this, {x: 0, y: 0}, {width: 0, height: 0});
    this.svgGroup = document.createElementNS(ElementView.svgURI, "g");
    this.svgGroup.id = "focus";
    this.svgBounding = this.boundingBox.svgGroup;

    this.svgGroup.appendChild(this.svgBounding);
    this.svgGroup.appendChild(this.boundingBox.refPointGroup);
  }

  public get SVG(): SVGGElement {
    return this.svgGroup;
  }

  public get boundingSVG(): SVGElement {
    return this.boundingBox.SVG;
  }

  public appendChild(element: ElementView, showBounding: boolean = true, call: boolean = true): void {
    this._children.add(element);
    element.onFocus();

    if (this._children.size == 1) {
      this.refPointView = Object.assign({}, element.refPoint);
      this.refPoint = Object.assign({}, element.refPoint);
      this._children.forEach((child: ElementView) => {
        if (!(child instanceof GroupView)) {
          this.rotate(element.angle);
        } else
          this.boundingBox.rotate(0);
      });
      this.container.style.fixGlobalStyle();
      this.container.style.setGlobalStyle(element.style);
    } else { /* more than one element */
      let elementRefPoint = Object.assign({}, element.refPoint);
      let refPoint = Object.assign({}, this.refPoint);
      element.refPoint = refPoint;
      element.correct(refPoint, elementRefPoint);
      this.container.style.recoverGlobalStyle();
    }
    this.fit();
    if(showBounding)
      this.focus(element.rotatable);

    if (call) {
      this.container.call(Callback.ELEMENT_FOCUSED, {element: element});
    }
  }
  public removeChild(element: ElementView, call: boolean = true): void {
    this._children.delete(element);
    element.onBlur();
    this.container.editTool.removeEditableElement();
    if (this._children.size == 0) {
      /* no element */
      this.container.style.recoverGlobalStyle();
      this.blur();
    } else if (this._children.size == 1) {
      /* one element */
      this.container.style.fixGlobalStyle();
      this._children.forEach((child: ElementView) => {
        this.container.style.setGlobalStyle(child.style);
        this.rotate(child.angle);
        this.focus(child.rotatable);
      });
      if (call) {
        this.container.call(Callback.ELEMENT_BLURRED, {element: element});
      }
    } else {
      /* multiple elements */
      let rotatable: boolean = true;
      for (let child of this._children) {
        if (!child.rotatable) {
          rotatable = false;
          break;
        }
      }
      this.focus(rotatable);
      if (call) {
        this.container.call(Callback.ELEMENT_BLURRED, {element: element});
      }
    }

    this.fit();
  }
  public clear(call: boolean = true): void {
    let thereIsElement = this._children.size > 0;
    this.blur(call && thereIsElement); /* call blur callback function only when there is focused element */
    this.container.style.recoverGlobalStyle(call && thereIsElement); /* call style change callback function only when there is focused element */
    this._children.forEach((child: ElementView) => {
      child.onBlur();
    });
    this._children.clear();
  }

  public remove(call: boolean = true): void {
    let elements: Set<ElementView> = new Set<ElementView>();
    this._children.forEach((child: ElementView) => {
      elements.add(child);
    });

    this._children.forEach((child: ElementView) => this.container.remove(child, false, false));
    this.clear();

    if (call) {
      this.container.call(Callback.ELEMENT_DELETED, {elements: elements});
    }
  }

  public orderTop(call: boolean = true): void {
    this._children.forEach((child: ElementView) => {
      this.container.elementsGroup.appendChild(child.SVG);
    });

    if (call) {
      this.container.call(Callback.TO_TOP, {elements: this._children});
    }
  }
  public orderUp(call: boolean = true): void {}
  public orderDown(call: boolean = true): void {}
  public orderBottom(call: boolean = true): void {
    let firstChild = this.container.elementsGroup.firstChild;
    this._children.forEach((child: ElementView) => {
      this.container.elementsGroup.insertBefore(child.SVG, firstChild);
    });

    if (call) {
      this.container.call(Callback.TO_BOTTOM, {elements: this._children});
    }
  }

  public get canGroup(): boolean {
    return this._children.size > 1;
  }
  public get canUngroup(): boolean {
    if (this._children.size == 1) {
      let [element] = this._children;
      if (element instanceof GroupView)
        return true;
    }
    return false;
  }
  public group(call: boolean = true): GroupView | undefined {
    if (this._children.size < 2) return undefined;

    let children: Set<ElementView> = new Set<ElementView>();
    let group = new GroupView(this.container);
    this._children.forEach((element: ElementView) => {
      group.addElement(element);
      this.container.elements.delete(element);
      element.group = group;
      children.add(element);
    });

    this._children.clear();
    this.container.add(group);
    this._children.add(group);

    let lastRefPoint = this.refPoint;
    let refPoint = Object.assign({}, group.center);
    this.refPoint = refPoint;
    this.refPointView = refPoint;
    group.correct(refPoint, lastRefPoint);

    this.fit();
    this.boundingBox.rotate(0);
    this.focus();

    if (call) {
      this.container.call(Callback.GROUP, {elements: children, group: group});
      this.container.call(Callback.ELEMENT_FOCUSED, {element: group});
    }

    return group;
  }
  public ungroup(call: boolean = true) {
    if (this._children.size > 1) return;
    let [group] = this._children;
    if (!(group instanceof GroupView)) /* can ungroup only single, group element */
      return;

    this.container.blur();
    group.elements.forEach((element: ElementView) => {
      this.container.add(element);
      this.container.focus(element);
    });
    this.container.remove(group, true, false);

    if (call) {
      this.container.call(Callback.UNGROUP, {element: group});
    }
  }

  public get children(): Set<ElementView> {
    return this._children;
  }

  public get position(): Point {
    return this.boundingBox.position;
  }
  public set translate(delta: Point) {
    this._children.forEach((child: ElementView) => {
      child.SVG.style.transform =
        "translate(" + delta.x + "px, " + delta.y + "px) rotate(" + child.angle + "deg)";
    });
    this.svgGroup.style.transform =
        " translate(" + delta.x + "px, " + delta.y + "px)";
  }
  public set position(delta: Point) {
    this._children.forEach((child: ElementView) => child.position = delta);

    let refPoint = {
      x: this.lastRefPoint.x + delta.x,
      y: this.lastRefPoint.y + delta.y
    };
    this.refPoint = refPoint;
    this.refPointView = refPoint;

    this.boundingBox.correctByDelta(delta);
  }
  public correct(point: Point): void {
    this._children.forEach((child: ElementView) => child.correct(point, this.lastRefPoint));

    this.boundingBox.correct(point, this.lastRefPoint);
  }

  public get visibleCenter(): Point {
    let rect = this.visibleBoundingRect;

    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    }
  }
  public get center(): Point {
    let rect = this.boundingRect;

    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    }
  }

  public get size(): Size {
    return this.boundingRect;
  }
  public setSize(rect: Rect, delta: Point | null = null): void {
    if (this._children.size == 1) {
      this._children.forEach(child => child.setSize(rect, delta));
    } else {
      /* TODO */
    }
    this.fit();
  }

  private calculateBoundingRect(visible: boolean): Rect {
    let minX, minY;
    let maxX, maxY;

    let children = Array.from(this._children);
    if (children.length < 1)
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };

    let firstChild = children[0];

    let firstBoundingRect = visible ? firstChild.visibleBoundingRect : firstChild.boundingRect;

    minX = firstBoundingRect.x;
    minY = firstBoundingRect.y;
    maxX = firstBoundingRect.width + minX;
    maxY = firstBoundingRect.height + minY;

    for (let i = 1; i < children.length; i++) {
      let boundingRect = visible ? children[i].visibleBoundingRect : children[i].boundingRect;
      if (boundingRect.x < minX)
        minX = boundingRect.x;
      if (boundingRect.y < minY)
        minY = boundingRect.y;
      if (boundingRect.width + boundingRect.x > maxX)
        maxX = boundingRect.width + boundingRect.x;
      if (boundingRect.height + boundingRect.y > maxY)
        maxY = boundingRect.height + boundingRect.y;
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  public get boundingRect(): Rect {
    return this.calculateBoundingRect(false);
  }
  public get visibleBoundingRect(): Rect {
    return this.calculateBoundingRect(true);
  }

  public set lastRefPoint(point: Point) {
    this.boundingBox.lastRefPoint = point;
  }
  public get lastRefPoint(): Point {
    return this.boundingBox.lastRefPoint;
  }
  public get lastRect(): Rect {
    return {
      x: this._lastPosition.x,
      y: this._lastPosition.y,
      width: this._lastSize.width,
      height: this._lastSize.height,
    };
  }

  public fixRect(): void {
    this._lastPosition = this.position;
    this._lastSize = this.size;
    this._children.forEach(child => child.fixRect());
    this.boundingBox.fixPosition();
  }
  public fixRefPoint(): void {
    this.boundingBox.fixRefPoint();
  }
  public fixPosition(): void {
    this._lastPosition = this.position;
    this._children.forEach(child => child.fixPosition());
    this.boundingBox.fixRefPoint();
    this.boundingBox.fixPosition();
  }
  public fixSize(): void {
    this._lastSize = this.size;
  }
  public set lastAngle(angle: number) {
    this._lastAngle = angle;
  }

  public hasChild(xElement: ElementView): boolean {
    return this._children.has(xElement);
  }

  public recenterRefPoint(call: boolean = true) {
    this.fixRefPoint();
    let center;
    if (this._children.size > 1) {
      center = this.visibleCenter;

      this.refPointView = center;
      this.refPoint = center;
      this.correct(center);
      this.fit();
    } else {
      center = Matrix.rotate(
        [this.center],
        this.refPoint,
        -this.angle
      )[0];

      this.refPointView = center;
      this.refPoint = center;
      this.correct(center);
      this.fit();

      let [firstElement] = this._children;
      if (firstElement instanceof GroupView) {
        this.boundingBox.rotate(0);
      }
    }

    if (call) {
      this.container.call(Callback.RECENTER_REFERENCE_POINT, {elements: this._children});
    }
  }
  public get refPoint(): Point {
    return this.boundingBox.refPoint;
  }
  public set refPoint(point: Point) {
    this._children.forEach(child => child.refPoint = point);
    this.boundingBox.refPoint = point;
  }
  public set refPointView(point: Point) {
    this.boundingBox.refPointView = point;
  }

  public get angle(): number {
    return this.boundingBox.angle;
  }
  public rotate(angle: number) {
    if (this._children.size == 1)
      this._children.forEach(child => child.rotate(angle));
    else
      this._children.forEach(child =>
        child.rotate((angle + child.lastAngle - this._lastAngle) % 360));
    this.boundingBox.rotate(angle);
  }

  public fit(): void {
    if (this._children.size != 1) {
      this.fitVisible();
      this.boundingBox.rotate(0);
      return;
    }

    let contentRect: Rect = this.boundingRect;

    this.boundingBox.boundingRect = contentRect;
    this.boundingBox.position = contentRect;
    this.boundingBox.setSize(contentRect);
    this.boundingBox.positionGrips();
  }
  public fitVisible(): void {
    let contentRect: Rect = this.visibleBoundingRect;

    this.boundingBox.boundingRect = contentRect;
    this.boundingBox.position = contentRect;
    this.boundingBox.setSize(contentRect);
    this.boundingBox.positionGrips();
  }

  public focus(rotatable: boolean = true) {
    if (this._children.size > 1) {
      this.boundingBox.multipleFocus(rotatable);
    } else {
      let [singleElement] = this._children;

      if (singleElement instanceof GroupView) {
        this.boundingBox.multipleFocus(rotatable);
      } else {
        this.boundingBox.singleFocus(rotatable);
      }
    }
  }
  public blur(call: boolean = true) {
    this.boundingBox.blur();
    if (call) {
      this.container.call(Callback.BLURRED);
    }
  }

  public highlight() {
    this._children.forEach((child: ElementView) => {
      child.highlight();
    });
  }
  public lowlight() {
    this._children.forEach((child: ElementView) => {
      child.lowlight();
    });
  }

  public toPath() {
    if (this._children.size == 0) return;
    let refPoint = Object.assign({}, this.refPoint);

    let path = new PathView(this.container);
    this._children.forEach((child: ElementView) => {
      path.add(child.toPath());
    });
    this.remove();

    this.container.add(path);
    this.container.focus(path);

    this.refPointView = refPoint;
    this.refPoint = refPoint;
  }

  public copy(call: boolean = true): void {
    this.lastCopyPosition = this.position;
    this._children.forEach((child: ElementView) => {
      this.elementsClipboard.add(child.copy);
    });

    if (call) {
      this.container.call(Callback.COPY, {elements: this._children});
    }
  }
  public cut(call: boolean = true): void {
    this.copy(false);
    this.remove(false);

    if (call) {
      this.container.call(Callback.CUT, {elements: this._children});
    }
  }
  public paste(call: boolean = true, sideEffects: boolean = true): void {
    let newIds: { elementOwnerId: string; elementIndex: number; }[] = [];
    if (sideEffects) {
      this.blur();
    }
    this.elementsClipboard.forEach((element: ElementView) => {
      element = element.copy; /* may paste many times */
      newIds.push({elementOwnerId: element.ownerId, elementIndex: element.index}); /* save copied element new id */

      element.container = this.container;
      element.fixRect();
      if (element instanceof GroupView)
        element.elements.forEach((child: ElementView) => {
          this.container.setElementActivity(child);
          child.container = this.container;
        });

      let oldPosition = element.position;
      element.position = {
        x: this.lastCopyPosition.x - oldPosition.x + 10,
        y: this.lastCopyPosition.y - oldPosition.y + 10
      };
      this.lastCopyPosition = element.position;
      this.container.add(element);

      this.appendChild(element, sideEffects);
    });

    if (call) {
      this.container.call(Callback.PASTE, {newIds: newIds});
    }
  }

  public on() {
    this.boundingBox.on();
  }
  public off() {
    this.boundingBox.off();
  }
}
