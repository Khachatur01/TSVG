/* eslint-disable @typescript-eslint/naming-convention */
import {ElementProperties, ElementView} from '../../../element/ElementView';
import {Draggable} from '../../tool/drag/Draggable';
import {Point} from '../../../model/Point';
import {BoundingBox} from './bound/BoundingBox';
import {Container} from '../../../Container';
import {Rect} from '../../../model/Rect';
import {Resizeable} from '../resize/Resizeable';
import {PathView} from '../../../element/shape/path/PathView';
import {GroupView} from '../../../element/group/GroupView';
import {SVGEvent} from '../../../dataSource/constant/SVGEvent';
import {Matrix} from '../../math/Matrix';
import {PointedView} from '../../../element/shape/pointed/PointedView';
import {CircleView} from '../../../element/shape/circluar/CircleView';
import {TableView} from '../../../element/complex/TableView';
import {ForeignObjectView} from '../../../element/foreign/ForeignObjectView';

export class Focus implements Draggable, Resizeable {

  public __clipboard__: {elements: Set<ElementView>; text: string; isSafe: boolean} = {
    elements: new Set<ElementView>(),
    text: '',
    isSafe: false, /* if in safe mode, then will be used this clipboard, to prevent clipboard sharing with browser clipboard */
  };
  public readonly boundingBox: BoundingBox;

  private readonly container: Container;
  private readonly _children: Set<ElementView> = new Set<ElementView>();
  private readonly svgGroup: SVGGElement;
  private readonly svgBounding: SVGGElement;

  private _lastAngle = 0;

  private pasteCount = 0;

  public constructor(container: Container) {
    this.container = container;

    this.boundingBox = new BoundingBox(this.container, this, {x: 0, y: 0, width: 0, height: 0});
    this.svgGroup = document.createElementNS(ElementView.svgURI, 'g');
    this.svgGroup.id = 'focus';
    this.svgBounding = this.boundingBox.__svgGroup__;

    this.svgGroup.appendChild(this.svgBounding);
    this.svgGroup.appendChild(this.boundingBox.__refPointGroup__);
  }

  public get SVG(): SVGGElement {
    return this.svgGroup;
  }

  public get boundingBoxSVG(): SVGElement {
    return this.boundingBox.SVG;
  }

  public appendChild(element: ElementView, showBounding: boolean = true, changeGlobalStyle: boolean = true, angle?: number, call: boolean = true): void {
    this._children.add(element);

    if (this._children.size === 1) {
      this.__refPointView__ = Object.assign({}, element.refPoint);
      this.__refPoint__ = Object.assign({}, element.refPoint);
      if (changeGlobalStyle) {
        this.container.style.__fixGlobalStyle__();
        this.container.style.__setGlobalStyle__(element.style);
      }
    } else { /* more than one element */
      const elementRefPoint = Object.assign({}, element.refPoint);
      const refPoint = Object.assign({}, this.__refPoint__);
      element.refPoint = refPoint;
      element.__correct__(refPoint, elementRefPoint);
      if (showBounding) {
        this.container.style.__recoverGlobalStyle__();
      }
    }

    this.__fit__(angle);
    if (showBounding) {
      this.__focus__();
    }

    if (call) {
      this.container.__call__(SVGEvent.ELEMENTS_FOCUSED, {elements: new Set([element])});
    }
  }
  public removeChild(element: ElementView, call: boolean = true): void {
    this._children.delete(element);
    element.__onBlur__();

    if (this._children.size === 0) {
      /* no element */
      this.container.style.__recoverGlobalStyle__();
      this.__blur__(call);
    } else if (this._children.size === 1) {
      /* one element */
      this.container.style.__fixGlobalStyle__();
      this._children.forEach((child: ElementView) => {
        this.container.style.__setGlobalStyle__(child.style);
        this.__rotate__(child.angle);
        this.__focus__();
      });
    } else {
      this.__focus__();
    }

    if (call) {
      this.container.__call__(SVGEvent.ELEMENTS_BLURRED, {elements: new Set([element])});
    }
    this.__fit__();
  }
  public clear(call: boolean = true): void {
    const thereIsElement = this._children.size > 0;
    this.__blur__(call && thereIsElement); /* call blur callback function only when there is focused element */
    this.container.style.__recoverGlobalStyle__(call && thereIsElement); /* call style change callback function only when there is focused element */
    this._children.forEach((child: ElementView) => {
      child.__onBlur__();
    });
    this._children.clear();
    if (call) {
      this.container.__call__(SVGEvent.ALL_BLURRED);
    }
  } /* blur all elements */
  public remove(call: boolean = true): void {
    const elements: Set<ElementView> = new Set<ElementView>();
    this._children.forEach((child: ElementView) => {
      elements.add(child);
    });

    this._children.forEach((child: ElementView) => this.container.remove(child, true, false));
    this.clear();

    if (call) {
      const elementsCopy: ElementView[] = [];
      elements.forEach((element: ElementView) => {
        elementsCopy.push(element.copy);
      });
      this.container.__call__(SVGEvent.ELEMENTS_DELETED, {elements: elementsCopy});
    }
  }

  public orderTop(call: boolean = true): void {
    this._children.forEach((child: ElementView) => {
      this.container.__elementsGroup__.appendChild(child.SVG);
      this.container.elements.delete(child);
      this.container.elements.add(child);
    });

    if (call) {
      this.container.__call__(SVGEvent.TO_TOP, {elements: this._children});
    }
  }
  public orderUp(call: boolean = true): void {}
  public orderDown(call: boolean = true): void {}
  public orderBottom(call: boolean = true): void {
    const newElements = new Set<ElementView>();

    const firstChild = this.container.__elementsGroup__.firstChild;
    this._children.forEach((child: ElementView) => {
      this.container.__elementsGroup__.insertBefore(child.SVG, firstChild);
      this.container.elements.delete(child);
      newElements.add(child);
    });

    this.container.elements.forEach((child: ElementView) => {
      newElements.add(child);
    });

    this.container.elements = newElements;

    if (call) {
      this.container.__call__(SVGEvent.TO_BOTTOM, {elements: this._children});
    }
  }

  public get canGroup(): boolean {
    return this._children.size > 1;
  }
  public get canUngroup(): boolean {
    if (this._children.size === 1) {
      const [element] = this._children;
      if (element instanceof GroupView) {
        return true;
      }
    }
    return false;
  }
  public group(call: boolean = true): GroupView | undefined {
    if (this._children.size < 2) {
      return undefined;
    }

    const children: Set<ElementView> = new Set<ElementView>();
    const group = new GroupView(this.container);
    this._children.forEach((element: ElementView) => {
      this.container.elements.delete(element);
      children.add(element);
    });

    this._children.clear();
    this.container.add(group);
    this._children.add(group);
    group.setElements(children);

    const lastRefPoint = this.__refPoint__;
    const refPoint = Object.assign({}, group.center);
    this.__refPoint__ = refPoint;
    this.__refPointView__ = refPoint;
    group.__correct__(refPoint, lastRefPoint);

    this.__fit__();
    this.__focus__();

    if (call) {
      this.container.__call__(SVGEvent.GROUP, {elements: children, group});
      this.container.__call__(SVGEvent.ELEMENTS_FOCUSED, {elements: group});
    }

    return group;
  }
  public ungroup(call: boolean = true) {
    if (this._children.size > 1) {
      return;
    }
    const [group] = this._children;
    if (!(group instanceof GroupView)) { /* can ungroup only single, group element */
      return;
    }

    this.container.blur();
    group.elements.forEach((element: ElementView) => {
      this.container.add(element);
    });
    this.container.remove(group, true, false);

    if (call) {
      this.container.__call__(SVGEvent.UNGROUP, {element: group});
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
  public containsTableElement(): boolean {
    for (const child of this._children) {
      if (child instanceof TableView) {
        return true;
      }
    }
    return false;
  }

  public __translate__(delta: Point): void {
    this._children.forEach(child => child.__translate__(delta));
    this.svgGroup.style.transform = ' translate(' + delta.x + 'px, ' + delta.y + 'px)';
  }
  public __drag__(delta: Point): void {
    this._children.forEach(child => child.__drag__(delta));

    const refPoint = {
      x: this.__lastRefPoint__.x + delta.x,
      y: this.__lastRefPoint__.y + delta.y
    };
    this.__refPoint__ = refPoint;
    this.__refPointView__ = refPoint;

    this.boundingBox.__drag__(delta);
    this.boundingBox.__positionGrips__();
  }
  public drag(delta: Point, call: boolean = true): void {
    this.__fixRect__();
    this.__fixRefPoint__();
    this.__drag__({x: delta.x, y: delta.y});

    const position: Point = {
      x: this.boundingBox.getRect().x,
      y: this.boundingBox.getRect().y,
    };
    if (call) {
      this.container.__call__(SVGEvent.ELEMENTS_DRAGGED, {
        elements: this._children,
        angle: this.boundingBox.angle,
        refPoint: this.boundingBox.refPoint,
        delta, position
      });
    }
  }
  public setPosition(position: Point, call: boolean = true): void {
    const delta: Point = {
      x: position.x - this.boundingBox.getRect().x,
      y: position.y - this.boundingBox.getRect().y
    };

    this.drag(delta, false);

    /*
    * rect and reference point should be fixed before resetting translate
    * translation reset method uses previously fixed values of rect and reference point
    */
    this.__fixRect__();
    this.__fixRefPoint__();
    this.__translate__({x: 0, y: 0});
    if (call) {
      this.container.__call__(SVGEvent.SET_ELEMENTS_POSITION, {elements: this._children, position});
    }
  }

  public __correct__(point: Point): void {
    this._children.forEach((child: ElementView) => child.__correct__(point, this.__lastRefPoint__));

    this.boundingBox.__correct__(point, this.__lastRefPoint__);
  }

  public get visibleCenter(): Point {
    const rect = this.getVisibleRect();

    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
  }
  public get center(): Point {
    const rect = this.getRect();

    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
  }

  public __setRect__(rect: Rect): void {
    if (this._children.size === 1) {
      this._children.forEach(child => child.__setRect__(rect));
    } else {
      this._children.forEach(child => child.__setRect__(rect));
    }
    this.__fit__();
  }
  public setRect(rect: Rect): void {
    this.__fixRect__();
    this.__fixRefPoint__();
    this.__setRect__(rect);
  }

  private calculateBoundingRect(visible: boolean): Rect {
    const children: ElementView[] = Array.from(this._children);
    if (children.length < 1) {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    }

    const firstChild: ElementView = children[0];

    const firstRect: Rect = visible ? firstChild.getVisibleRect() : firstChild.getRect();

    let minX: number = firstRect.x;
    let minY: number = firstRect.y;
    let maxX: number = firstRect.width + minX;
    let maxY: number = firstRect.height + minY;

    for (let i = 1; i < children.length; i++) {
      const rect: Rect = visible ? children[i].getVisibleRect() : children[i].getRect();
      if (rect.x < minX) {
        minX = rect.x;
      }
      if (rect.y < minY) {
        minY = rect.y;
      }
      if (rect.width + rect.x > maxX) {
        maxX = rect.width + rect.x;
      }
      if (rect.height + rect.y > maxY) {
        maxY = rect.height + rect.y;
      }
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
    const rect = this.boundingBox.getRect();
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
  public get __lastRect__(): Rect {
    return this.boundingBox.__lastRect__;
  }
  public get __lastAngle__(): number {
    return this._lastAngle;
  }

  public __fixRect__(): void {
    this.boundingBox.__fixRect__();
    this._children.forEach((child: ElementView) => child.__fixRect__());
  }
  public __fixRefPoint__(): void {
    this.boundingBox.__fixRefPoint__();
    this._children.forEach((child: ElementView) => child.__fixRefPoint__());
  }
  public __fixAngle__(): void {
    this._lastAngle = this.angle;
    this._children.forEach((child: ElementView) => child.__fixAngle__());
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
      this.container.__call__(SVGEvent.RECENTER_REFERENCE_POINT, {elements: this._children});
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
  public get refPoint(): Point {
    return this.boundingBox.refPoint;
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
  public __rotate__(angle: number): void {
    if (this._children.size === 1) {
      this._children.forEach(child => child.__rotate__(angle));
    } else {
      this._children.forEach(child =>
        child.__rotate__((angle + child.__lastAngle__ - this._lastAngle) % 360)
      );
    }
    this.boundingBox.__rotate__(angle);
  }

  /**
   * @param toAngle rotate focused element to this angle from fromAngle
   * @param fromAngle rotate focused elements from this angle to toAngle
   * */
  public rotate(toAngle: number, fromAngle: number = 0) {
    this._lastAngle = fromAngle;
    this._children.forEach((child: ElementView) => {
      child.__fixAngle__();
    });
    this.__rotate__(toAngle);
  }

  public __fit__(angle?: number): void {
    let visible = false;
    if (!angle) {
      if (this._children.size === 1) {
        const [singleChild] = this._children;
        angle = singleChild.angle;
      } else {
        angle = 0;
        visible = true;
      }
    }
    this.boundingBox.__rotate__(angle);
    //
    // if (this._children.size === 1) {
    //   const [singleChild] = this._children;
    //   this.boundingBox.__rotate__(singleChild.angle);
    // } else {
    //   this.boundingBox.__rotate__(0);
    //   visible = true;
    // }

    this.boundingBox.__setRect__(this.calculateBoundingRect(visible));
    this.boundingBox.__positionGrips__();
  }

  public __focus__(): void {
    let rotatable = true;
    for (const child of this._children) {
      if (!child.rotatable) {
        rotatable = false;
        break;
      }
    }

    if (this._children.size > 1) {
      this.boundingBox.__multipleFocus__(rotatable);
    } else {
      const [singleElement] = this._children;
      if (singleElement instanceof GroupView) {
        this.boundingBox.__multipleFocus__(rotatable);
      } else if (singleElement instanceof CircleView) {
        this.boundingBox.__onlyCircleFocus__(rotatable);
      } else {
        this.boundingBox.__singleFocus__(rotatable);
      }
    }
  }
  public __blur__(call: boolean = true): void {
    this.boundingBox.__blur__();
    if (call) {
      this.container.__call__(SVGEvent.ALL_BLURRED);
    }
  }

  public highlight(): void {
    this._children.forEach((child: ElementView) => {
      child.__highlight__();
    });
  }
  public lowlight(): void {
    this._children.forEach((child: ElementView) => {
      child.__lowlight__();
    });
  }

  public toPath(properties: ElementProperties = {overEvent: true}): void {
    if (this._children.size === 0) {return;}
    const refPoint = Object.assign({}, this.__refPoint__);

    const path = new PathView(this.container, properties);
    this._children.forEach((child: ElementView) => {
      path.addPath(child.toPath().path);
    });
    path.style.fillColor = 'none';
    path.style.strokeColor = '#000000';
    this.remove();

    this.container.add(path);
    this.container.focus(path);

    this.__refPointView__ = refPoint;
    this.__refPoint__ = refPoint;
  }

  public set safeClipboard(isSafe: boolean) {
    this.__clipboard__.isSafe = isSafe;
    this._children.forEach((child: ElementView) => {
      if (child instanceof ForeignObjectView) {
        child.safeClipboard = isSafe;
      }
    });
  }
  public copy(call: boolean = true): void {
    this.pasteCount = 0;
    this.__clipboard__.elements.clear();
    this._children.forEach((child: ElementView) => {
      this.__clipboard__.elements.add(child);
    });

    if (call) {
      this.container.__call__(SVGEvent.COPY, {elements: this._children});
    }
  }
  public cut(call: boolean = true): void {
    const childrenCopy: Set<ElementView> = new Set<ElementView>();
    this._children.forEach((child: ElementView) => {
      const copy = child.copy;
      copy.setId(child.ownerId, child.index);
      childrenCopy.add(child);
    });

    this.copy(false);
    this.remove(false);

    if (call) {
      this.container.__call__(SVGEvent.CUT, {elements: childrenCopy});
    }
  }
  public paste(call: boolean = true, showBounding: boolean = true): void {
    this.pasteCount++;
    const newElements: ElementView[] = [];

    this.clear(false);
    this.__clipboard__.elements.forEach((element: ElementView) => {
      element = element.copy; /* may paste many times */
      element.ownerId = this.container.ownerId;
      element.index = this.container.nextElementIndex;
      newElements.push(element);

      element.container = this.container;
      element.__fixRect__();
      if (element instanceof GroupView) {
        element.elements.forEach((child: ElementView) => {
          this.container.__setElementActivity__(child);
          child.container = this.container;
          child.ownerId = this.container.ownerId;
          child.index = this.container.nextElementIndex;
        });
      }

      element.__drag__({
        x: this.pasteCount * 10,
        y: this.pasteCount * 10
      });
      this.container.add(element);

      /* do not call SVGEvent.ELEMENTS_FOCUSED event now, to call after sending SVGEvent.PASTE event */
      this.appendChild(element, showBounding, true, undefined, false);
    });

    if (call) {
      this.container.__call__(SVGEvent.PASTE, {elements: newElements});
      this.container.__call__(SVGEvent.ELEMENTS_FOCUSED, {elements: this._children});
    }
  }

  public on(): void {
    this.boundingBox.__on__();
  }
  public off(): void {
    this.boundingBox.__off__();
  }
}
