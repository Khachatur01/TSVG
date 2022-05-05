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
import {Event} from "../../../dataSource/constant/Event";
import {Matrix} from "../../math/Matrix";
import {CircularView} from "../../../element/shape/circluar/CircularView";
import {PointedView} from "../../../element/shape/pointed/PointedView";

export class Focus implements Draggable, Resizeable {
  private readonly container: Container;
  private readonly _children: Set<ElementView> = new Set<ElementView>();
  private readonly svgGroup: SVGGElement;
  private readonly svgBounding: SVGGElement;

  private ___lastAngle__: number = 0;

  public readonly boundingBox: BoundingBox;

  private pasteCount: number = 0;
  private elementsClipboard: Set<ElementView> = new Set<ElementView>();

  public constructor(container: Container) {
    this.container = container;

    this.boundingBox = new BoundingBox(this.container, this, {x: 0, y: 0, width: 0, height: 0});
    this.svgGroup = document.createElementNS(ElementView.svgURI, "g");
    this.svgGroup.id = "focus";
    this.svgBounding = this.boundingBox.__svgGroup__;

    this.svgGroup.appendChild(this.svgBounding);
    this.svgGroup.appendChild(this.boundingBox.__refPointGroup__);
  }

  public get SVG(): SVGGElement {
    return this.svgGroup;
  }

  public get boundingSVG(): SVGElement {
    return this.boundingBox.SVG;
  }

  public appendChild(element: ElementView, showBounding: boolean = true, changeGlobalStyle: boolean = true, call: boolean = true): void {
    this._children.add(element);

    if (this._children.size == 1) {
      this.__refPointView__ = Object.assign({}, element.refPoint);
      this.__refPoint__ = Object.assign({}, element.refPoint);
      if (changeGlobalStyle) {
        this.container.style.__fixGlobalStyle__();
        this.container.style.__setGlobalStyle__(element.style);
      }
    } else { /* more than one element */
      let elementRefPoint = Object.assign({}, element.refPoint);
      let refPoint = Object.assign({}, this.__refPoint__);
      element.refPoint = refPoint;
      element.__correct__(refPoint, elementRefPoint);
      if (showBounding) {
        this.container.style.__recoverGlobalStyle__();
      }
    }

    this.__fit__();
    if(showBounding) {
      this.__focus__(element.rotatable);
    }

    if (call) {
      this.container.__call__(Event.ELEMENT_FOCUSED, {element: element});
    }
  }
  public removeChild(element: ElementView, call: boolean = true): void {
    this._children.delete(element);
    element.__onBlur__();

    if (this._children.size == 0) {
      /* no element */
      this.container.style.__recoverGlobalStyle__();
      this.__blur__();
    } else if (this._children.size == 1) {
      /* one element */
      this.container.style.__fixGlobalStyle__();
      this._children.forEach((child: ElementView) => {
        this.container.style.__setGlobalStyle__(child.style);
        this.__rotate__(child.angle);
        this.__focus__(child.rotatable);
      });
      if (call) {
        this.container.__call__(Event.ELEMENT_BLURRED, {element: element});
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
      this.__focus__(rotatable);
      if (call) {
        this.container.__call__(Event.ELEMENT_BLURRED, {element: element});
      }
    }

    this.__fit__();
  }
  public clear(call: boolean = true): void {
    let thereIsElement = this._children.size > 0;
    this.__blur__(call && thereIsElement); /* call blur callback function only when there is focused element */
    this.container.style.__recoverGlobalStyle__(call && thereIsElement); /* call style change callback function only when there is focused element */
    this._children.forEach((child: ElementView) => {
      child.__onBlur__();
    });
    this._children.clear();
  } /* blur all elements */
  public remove(call: boolean = true): void {
    let elements: Set<ElementView> = new Set<ElementView>();
    this._children.forEach((child: ElementView) => {
      elements.add(child);
    });

    this._children.forEach((child: ElementView) => this.container.remove(child, true, false));
    this.clear();

    if (call) {
      this.container.__call__(Event.ELEMENTS_DELETED, {elements: elements});
    }
  }

  public orderTop(call: boolean = true): void {
    this._children.forEach((child: ElementView) => {
      this.container.elementsGroup.appendChild(child.SVG);
      this.container.elements.delete(child);
      this.container.elements.add(child);
    });

    if (call) {
      this.container.__call__(Event.TO_TOP, {elements: this._children});
    }
  }
  public orderUp(call: boolean = true): void {}
  public orderDown(call: boolean = true): void {}
  public orderBottom(call: boolean = true): void {
    let newElements = new Set<ElementView>();

    let firstChild = this.container.elementsGroup.firstChild;
    this._children.forEach((child: ElementView) => {
      this.container.elementsGroup.insertBefore(child.SVG, firstChild);
      this.container.elements.delete(child);
      newElements.add(child);
    });

    this.container.elements.forEach((child: ElementView) => {
      newElements.add(child);
    });

    this.container.elements = newElements;

    if (call) {
      this.container.__call__(Event.TO_BOTTOM, {elements: this._children});
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

    this._children.clear();
    this.container.add(group);
    this._children.add(group);
    group.setElements(children);

    let lastRefPoint = this.__refPoint__;
    let refPoint = Object.assign({}, group.center);
    this.__refPoint__ = refPoint;
    this.__refPointView__ = refPoint;
    group.__correct__(refPoint, lastRefPoint);

    this.__fit__();
    this.__focus__();

    if (call) {
      this.container.__call__(Event.GROUP, {elements: children, group: group});
      this.container.__call__(Event.ELEMENT_FOCUSED, {element: group});
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
    });
    this.container.remove(group, true, false);

    if (call) {
      this.container.__call__(Event.UNGROUP, {element: group});
    }
  }

  public get children(): Set<ElementView> {
    return this._children;
  }

  public containsPointedElement(): boolean {
    for (const child of this._children) {
      if (child instanceof PointedView) {
        return true;
      }
    }
    return false;
  }

  public __translate__(delta: Point) {
    this._children.forEach(child => child.__translate__(delta));
    this.svgGroup.style.transform =
        " translate(" + delta.x + "px, " + delta.y + "px)";
  }
  public __drag__(delta: Point) {
    this._children.forEach(child => child.__drag__(delta));

    let refPoint = {
      x: this.__lastRefPoint__.x + delta.x,
      y: this.__lastRefPoint__.y + delta.y
    };
    this.__refPoint__ = refPoint;
    this.__refPointView__ = refPoint;

    this.boundingBox.__correctByDelta__(delta);
  }
  public drag(delta: Point, call: boolean = true) {
    this.__fixRect__();
    this.__fixRefPoint__();
    this.__drag__({x: delta.x, y: delta.y});

    if (call) {
      this.container.__call__(Event.ELEMENTS_DRAGGED, {elements: this._children, delta: delta});
    }
  }
  public nudge(delta: Point, call: boolean = true) {
    this.__fixRect__();
    this.__fixRefPoint__();
    this.__drag__({x: delta.x, y: delta.y});

    if (call) {
      this.container.__call__(Event.ELEMENTS_NUDGED, {elements: this._children, delta: delta});
    }
  }

  public __correct__(point: Point): void {
    this._children.forEach((child: ElementView) => child.__correct__(point, this.__lastRefPoint__));

    this.boundingBox.__correct__(point, this.__lastRefPoint__);
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

  public __setRect__(rect: Rect, delta?: Point): void {
    if (this._children.size == 1) {
      this._children.forEach(child => child.__setRect__(rect, delta));
    } else {
      /* TODO */
    }
    this.__fit__();
  }
  public setRect(rect: Rect, delta?: Point): void {
    this.__fixRect__();
    this.__fixRefPoint__();
    this.__setRect__(rect, delta);
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
      this.__refPoint__,
      -this.angle
    );
    return ElementView.calculateRect(points);
  }

  public get __lastRefPoint__(): Point {
    return this.boundingBox.__lastRefPoint__;
  }
  public set __lastRefPoint__(point: Point) {
    this.boundingBox.__lastRefPoint__ = point;
  }
  public get __lastRect__(): Rect {
    return this.boundingBox.__lastRect__;
  }
  public set __lastAngle__(angle: number) {
    this.___lastAngle__ = angle;
  }
  public get __lastAngle__(): number {
    return this.___lastAngle__;
  }

  public __fixRect__(): void {
    this.boundingBox.__fixRect__();
    this._children.forEach(child => child.__fixRect__());
  }
  public __fixRefPoint__(): void {
    this.boundingBox.__fixRefPoint__();
  }
  public __fixAngle__(): void {
    this.___lastAngle__ = this.angle;
  }

  public hasChild(xElement: ElementView): boolean {
    return this._children.has(xElement);
  }

  public recenterRefPoint(call: boolean = true) {
    this.__fixRefPoint__();
    let center;
    if (this._children.size > 1) {
      center = this.visibleCenter;
    } else {
      center = Matrix.rotate(
        [this.center],
        this.__refPoint__,
        -this.angle
      )[0];
    }

    this.__refPointView__ = center;
    this.__refPoint__ = center;
    this.__correct__(center);
    this.__fit__();

    if (call) {
      this.container.__call__(Event.RECENTER_REFERENCE_POINT, {elements: this._children});
    }
  }
  public get __refPoint__(): Point {
    return this.boundingBox.refPoint;
  }
  public set __refPoint__(point: Point) {
    this._children.forEach(child => child.refPoint = point);
    this.boundingBox.refPoint = point;
    this.boundingBox.__refPointView__ = point;
  }
  public set refPoint(point: Point) {
    this.__fixRect__();
    this.__fixRefPoint__();
    this.__refPoint__ = point;
    this.__correct__(point);
  }
  public set __refPointView__(point: Point) {
    this.boundingBox.__refPointView__ = point;
  }

  public get angle(): number {
    return this.boundingBox.angle;
  }
  public __rotate__(angle: number) {
    if (this._children.size == 1)
      this._children.forEach(child => child.__rotate__(angle));
    else
      this._children.forEach(child =>
        child.__rotate__((angle + child.__lastAngle__ - this.___lastAngle__) % 360)
      );
    this.boundingBox.__rotate__(angle);
  }
  public rotate(angle: number) {
    this.__fixAngle__();
    this.__rotate__(angle);
  }

  public __fit__(): void {
    let visible = false;
    if (this._children.size != 1) {
      this.boundingBox.__rotate__(0);
      visible = true;
    } else {
      let [singleChild] = this._children;
      this.boundingBox.__rotate__(singleChild.angle);
    }

    this.boundingBox.__setRect__(this.calculateBoundingRect(visible));
    this.boundingBox.__positionGrips__();
  }

  public __focus__(rotatable: boolean = true) {
    if (this._children.size > 1) {
      this.boundingBox.__multipleFocus__(rotatable);
    } else {
      let [singleElement] = this._children;
      if (singleElement instanceof GroupView) {
        this.boundingBox.__multipleFocus__(rotatable);
      } else if (singleElement instanceof CircularView) {
        this.boundingBox.__onlyCircleFocus__(rotatable);
      } else {
        this.boundingBox.__singleFocus__(rotatable);
      }
    }
  }
  public __blur__(call: boolean = true) {
    this.boundingBox.__blur__();
    if (call) {
      this.container.__call__(Event.BLURRED);
    }
  }

  public highlight() {
    this._children.forEach((child: ElementView) => {
      child.__highlight__();
    });
  }
  public lowlight() {
    this._children.forEach((child: ElementView) => {
      child.__lowlight__();
    });
  }

  public toPath() {
    if (this._children.size == 0) return;
    let refPoint = Object.assign({}, this.__refPoint__);

    let path = new PathView(this.container);
    this._children.forEach((child: ElementView) => {
      path.addPath(child.toPath());
    });
    this.remove();

    this.container.add(path);
    this.container.focus(path);

    this.__refPointView__ = refPoint;
    this.__refPoint__ = refPoint;
  }

  public copy(call: boolean = true): void {
    this.pasteCount = 0;
    this.elementsClipboard.clear();
    this._children.forEach((child: ElementView) => {
      this.elementsClipboard.add(child);
    });

    if (call) {
      this.container.__call__(Event.COPY, {elements: this._children});
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
      this.container.__call__(Event.CUT, {elements: childrenCopy});
    }
  }
  public paste(call: boolean = true, sideEffects: boolean = true): void {
    this.pasteCount++;
    let newElements: ElementView[] = [];

    this.clear(false);
    this.elementsClipboard.forEach((element: ElementView) => {
      element = element.copy; /* may paste many times */
      newElements.push(element);

      element.container = this.container;
      element.__fixRect__();
      if (element instanceof GroupView)
        element.elements.forEach((child: ElementView) => {
          this.container.__setElementActivity__(child);
          child.container = this.container;
        });

      element.__drag__({
        x: this.pasteCount * 10,
        y: this.pasteCount * 10
      });
      this.container.add(element);

      this.appendChild(element, sideEffects);
    });

    if (call) {
      this.container.__call__(Event.PASTE, {elements: newElements});
    }
  }

  public on() {
    this.boundingBox.__on__();
  }
  public off() {
    this.boundingBox.__off__();
  }
}
