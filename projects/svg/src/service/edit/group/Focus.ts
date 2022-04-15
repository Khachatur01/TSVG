import {ElementView} from "../../../element/ElementView";
import {Draggable} from "../../tool/drag/Draggable";
import {Point} from "../../../model/Point";
import {BoundingBox} from "./bound/BoundingBox";
import {Container} from "../../../Container";
import {Rect} from "../../../model/Rect";
import {Resizeable} from "../resize/Resizeable";
import {Size} from "../../../model/Size";
import {PathView} from "../../../element/shape/PathView";
import {GroupView} from "../../../element/group/GroupView";
import {Callback} from "../../../dataSource/constant/Callback";
import {Matrix} from "../../math/Matrix";
import {CircularView} from "../../../element/shape/circluar/CircularView";

export class Focus implements Draggable, Resizeable {
  private readonly container: Container;
  private readonly _children: Set<ElementView> = new Set<ElementView>();
  private readonly svgGroup: SVGGElement;
  private readonly svgBounding: SVGGElement;

  private _lastAngle: number = 0;

  public readonly boundingBox: BoundingBox;

  private pasteCount: number = 0;
  private elementsClipboard: Set<ElementView> = new Set<ElementView>();

  public constructor(container: Container) {
    this.container = container;

    this.boundingBox = new BoundingBox(this.container, this, {x: 0, y: 0, width: 0, height: 0});
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

    if (this._children.size == 1) {
      this.refPointView = Object.assign({}, element.refPoint);
      this.refPoint = Object.assign({}, element.refPoint);
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
    if(showBounding) {
      element.onFocus();
      this.focus(element.rotatable);
    }

    if (call) {
      this.container.call(Callback.ELEMENT_FOCUSED, {element: element});
    }
  }
  public removeChild(element: ElementView, call: boolean = true): void {
    this._children.delete(element);
    element.onBlur();

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
    // this.boundingBox.rect = {x: 0, y: 0, width: 0, height: 0};
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

    this._children.forEach((child: ElementView) => this.container.remove(child, true, false));
    this.clear();

    if (call) {
      this.container.call(Callback.ELEMENTS_DELETED, {elements: elements});
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
      this.container.elements.delete(element);
      element.group = group;
      children.add(element);
    });
    group.setElements(children);

    this._children.clear();
    this.container.add(group);
    this._children.add(group);

    let lastRefPoint = this.refPoint;
    let refPoint = Object.assign({}, group.center);
    this.refPoint = refPoint;
    this.refPointView = refPoint;
    group.correct(refPoint, lastRefPoint);

    this.fit();
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

  public translate(delta: Point) {
    this._children.forEach(child => child.translate(delta));
    this.svgGroup.style.transform =
        " translate(" + delta.x + "px, " + delta.y + "px)";
  }
  public drag(delta: Point) {
    this._children.forEach(child => child.drag(delta));

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
  public nudge(delta: Point, call: boolean = true) {
    this.fixRect();
    this.fixRefPoint();
    this.drag({x: delta.x, y: delta.y});

    if (call) {
      this.container.call(Callback.NUDGE, {elements: this._children, delta: delta});
    }
  }

  public get visibleCenter(): Point {
    let rect = this.getVisibleRect();

    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    }
  }
  public get center(): Point {
    let rect = this.getRect();

    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    }
  }

  public setRect(rect: Rect, delta?: Point): void {
    if (this._children.size == 1) {
      this._children.forEach(child => child.setRect(rect, delta));
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

    let firstRect = visible ? firstChild.getVisibleRect() : firstChild.getRect();

    minX = firstRect.x;
    minY = firstRect.y;
    maxX = firstRect.width + minX;
    maxY = firstRect.height + minY;

    for (let i = 1; i < children.length; i++) {
      let rect = visible ? children[i].getVisibleRect() : children[i].getRect();
      if (rect.x < minX)
        minX = rect.x;
      if (rect.y < minY)
        minY = rect.y;
      if (rect.width + rect.x > maxX)
        maxX = rect.width + rect.x;
      if (rect.height + rect.y > maxY)
        maxY = rect.height + rect.y;
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  public getRect(): Rect {
    return this.boundingBox.getRect();
  }
  public getVisibleRect(): Rect {
    let rect = this.boundingBox.getRect();
    let points: Point[] = [
      {x: rect.x, y: rect.y},
      {x: rect.x + rect.width, y: rect.y},
      {x: rect.x + rect.width, y: rect.y + rect.height},
      {x: rect.x, y: rect.y + rect.height}
    ];

    points = Matrix.rotate(
      points,
      this.refPoint,
      -this.angle
    );
    return ElementView.calculateRect(points);
  }

  public get lastRefPoint(): Point {
    return this.boundingBox.lastRefPoint;
  }
  public set lastRefPoint(point: Point) {
    this.boundingBox.lastRefPoint = point;
  }
  public get lastRect(): Rect {
    return this.boundingBox.lastRect;
  }
  public set lastAngle(angle: number) {
    this._lastAngle = angle;
  }
  public get lastAngle(): number {
    return this._lastAngle;
  }

  public fixRect(): void {
    this.boundingBox.fixRect();
    this._children.forEach(child => child.fixRect());
  }
  public fixRefPoint(): void {
    this.boundingBox.fixRefPoint();
  }

  public hasChild(xElement: ElementView): boolean {
    return this._children.has(xElement);
  }

  public recenterRefPoint(call: boolean = true) {
    this.fixRefPoint();
    let center;
    if (this._children.size > 1) {
      center = this.visibleCenter;
    } else {
      center = Matrix.rotate(
        [this.center],
        this.refPoint,
        -this.angle
      )[0];
    }

    this.refPointView = center;
    this.refPoint = center;
    this.correct(center);
    this.fit();

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
        child.rotate((angle + child.lastAngle - this._lastAngle) % 360)
      );
    this.boundingBox.rotate(angle);
  }

  public fit(): void {
    let visible = false;
    if (this._children.size != 1) {
      this.boundingBox.rotate(0);
      visible = true;
    } else {
      let [singleChild] = this._children;
      this.boundingBox.rotate(singleChild.angle);
    }

    this.boundingBox.setRect(this.calculateBoundingRect(visible));
    this.boundingBox.positionGrips();
  }

  public focus(rotatable: boolean = true) {
    if (this._children.size > 1) {
      this.boundingBox.multipleFocus(rotatable);
    } else {
      let [singleElement] = this._children;
      if (singleElement instanceof GroupView) {
        this.boundingBox.multipleFocus(rotatable);
      } else if (singleElement instanceof CircularView) {
        this.boundingBox.onlyCircleFocus(rotatable);
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
    this.pasteCount = 0;
    this.elementsClipboard.clear();
    this._children.forEach((child: ElementView) => {
      this.elementsClipboard.add(child.copy);
    });

    if (call) {
      this.container.call(Callback.COPY, {elements: this._children});
    }
  }
  public cut(call: boolean = true): void {
    let childrenCopy: Set<ElementView> = new Set<ElementView>();
    this._children.forEach((child: ElementView) => {
      let copy = child.copy;
      copy.setId(child.ownerId, child.index);
      childrenCopy.add(child);
    });

    this.copy(false);
    this.remove(false);

    if (call) {
      this.container.call(Callback.CUT, {elements: childrenCopy});
    }
  }
  public paste(call: boolean = true, sideEffects: boolean = true): void {
    this.pasteCount++;
    let newElements: ElementView[] = [];

    this.clear(false);
    this.elementsClipboard.forEach((element: ElementView) => {
      element = element.copy; /* may past many times */
      newElements.push(element);

      element.container = this.container;
      element.fixRect();
      if (element instanceof GroupView)
        element.elements.forEach((child: ElementView) => {
          this.container.setElementActivity(child);
          child.container = this.container;
        });

      element.drag({
        x: this.pasteCount * 10,
        y: this.pasteCount * 10
      });
      this.container.add(element);

      this.appendChild(element, sideEffects);
    });

    if (call) {
      this.container.call(Callback.PASTE, {elements: newElements});
    }
  }

  public on() {
    this.boundingBox.on();
  }
  public off() {
    this.boundingBox.off();
  }
}
