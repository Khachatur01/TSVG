import {ElementView} from './element/ElementView';
import {Focus} from './service/edit/group/Focus';
import {Drawers} from './dataSource/Drawers';
import {Grid} from './service/grid/Grid';
import {SVGEvent} from './dataSource/constant/SVGEvent';
import {GroupCursor, GroupView} from './element/group/GroupView';
import {Style} from './service/style/Style';
import {Point} from './model/Point';
import {TextBoxCursor, TextBoxView} from './element/foreign/text/TextBoxView';
import {Cursor} from './dataSource/constant/Cursor';
import {ForeignObjectCursor, ForeignObjectView} from './element/foreign/ForeignObjectView';
import {ElementType} from './dataSource/constant/ElementType';
import {EllipseCursor, EllipseView} from './element/shape/circluar/EllipseView';
import {BoxCursor, BoxView} from './element/shape/BoxView';
import {PathCursor, PathView} from './element/shape/path/PathView';
import {LineCursor, LineView} from './element/shape/pointed/LineView';
import {FreeCursor, FreeView} from './element/shape/path/FreeView';
import {PolylineCursor, PolylineView} from './element/shape/pointed/polyline/PolylineView';
import {PolygonCursor, PolygonView} from './element/shape/pointed/polygon/PolygonView';
import {TriangleCursor, TriangleView} from './element/shape/pointed/polygon/triangle/TriangleView';
import {RightTriangleCursor, RightTriangleView} from './element/shape/pointed/polygon/triangle/RightTriangleView';
import {
  IsoscelesTriangleCursor,
  IsoscelesTriangleView
} from './element/shape/pointed/polygon/triangle/IsoscelesTriangleView';
import {RectangleCursor, RectangleView} from './element/shape/pointed/polygon/rectangle/RectangleView';
import {ImageCursor, ImageView} from './element/foreign/media/ImageView';
import {VideoCursor, VideoView} from './element/foreign/media/VideoView';
import {CircleCursor, CircleView} from './element/shape/circluar/CircleView';
import {TableCursor, TableView} from './element/complex/TableView';
import {Tools} from './dataSource/Tools';
import {RayCursor, RayView} from './element/complex/cartesian/RayView';
import {GraphicCursor, GraphicView} from './element/complex/cartesian/GraphicView';
import {CoordinatePlaneCursor, CoordinatePlaneView} from './element/complex/cartesian/CoordinatePlaneView';
import {NumberLineCursor, NumberLineView} from './element/complex/cartesian/NumberLineView';
import {NumberLine2Cursor, NumberLineView2} from './element/complex/cartesian2/NumberLineView2';
import {CoordinatePlane2Cursor, CoordinatePlaneView2} from './element/complex/cartesian2/CoordinatePlaneView2';

export type SVGCallback = (parameters: any) => void;

class GlobalStyle extends Style {

  public readonly cursor: any = {
    element: {}
  };

  private readonly default: Style;
  private container: Container;

  public constructor(container: Container) {
    super();
    this.container = container;
    this.default = new Style();

    this.cursor[Cursor.NO_TOOL] = 'default';
    this.cursor[Cursor.DRAW] = 'crosshair';
    this.cursor[Cursor.DRAW_FREE] = 'crosshair';
    this.cursor[Cursor.DRAW_TEXT_BOX] = 'crosshair';
    this.cursor[Cursor.SELECT] = 'default';
    this.cursor[Cursor.ERASER] = 'crosshair';
    this.cursor[Cursor.EDIT_NODE] = 'default';
    this.cursor[Cursor.EDIT_TABLE] = 'default';
    this.cursor[Cursor.POINTER] = 'none';
    this.cursor[Cursor.HIGHLIGHTER] = 'crosshair';
    this.cursor[Cursor.BOUNDING_BOX] = 'move';
    this.cursor[Cursor.GRIP] = 'crosshair';
    this.cursor[Cursor.REFERENCE_POINT] = 'crosshair';
    this.cursor[Cursor.ROTATE_POINT] = 'crosshair';
    this.cursor[Cursor.NODE] = 'move';

    this.cursor.element[ElementType.ELLIPSE] = new EllipseCursor();
    this.cursor.element[ElementType.CIRCLE] = new CircleCursor();
    this.cursor.element[ElementType.BOX] = new BoxCursor();
    this.cursor.element[ElementType.PATH] = new PathCursor();
    this.cursor.element[ElementType.LINE] = new LineCursor();
    this.cursor.element[ElementType.FREE] = new FreeCursor();
    this.cursor.element[ElementType.POLYLINE] = new PolylineCursor();
    this.cursor.element[ElementType.POLYGON] = new PolygonCursor();
    this.cursor.element[ElementType.TRIANGLE] = new TriangleCursor();
    this.cursor.element[ElementType.RIGHT_TRIANGLE] = new RightTriangleCursor();
    this.cursor.element[ElementType.ISOSCELES_TRIANGLE] = new IsoscelesTriangleCursor();
    this.cursor.element[ElementType.RECTANGLE] = new RectangleCursor();
    this.cursor.element[ElementType.GROUP] = new GroupCursor();
    this.cursor.element[ElementType.FOREIGN_OBJECT] = new ForeignObjectCursor();
    this.cursor.element[ElementType.TEXT_BOX] = new TextBoxCursor();
    this.cursor.element[ElementType.IMAGE] = new ImageCursor();
    this.cursor.element[ElementType.VIDEO] = new VideoCursor();
    this.cursor.element[ElementType.RAY] = new RayCursor();
    this.cursor.element[ElementType.GRAPHIC] = new GraphicCursor();
    this.cursor.element[ElementType.COORDINATE_PLANE] = new CoordinatePlaneCursor();
    this.cursor.element[ElementType.COORDINATE_PLANE2] = new CoordinatePlane2Cursor();
    this.cursor.element[ElementType.NUMBER_LINE] = new NumberLineCursor();
    this.cursor.element[ElementType.NUMBER_LINE2] = new NumberLine2Cursor();
    this.cursor.element[ElementType.TABLE] = new TableCursor();
  }

  public override get strokeWidth(): string {
    return super.strokeWidth;
  }
  public override set strokeWidth(width: string) {
    super.strokeWidth = width;
    if (this.container.focused.children.size === 0) {
      this.default.strokeWidth = width;
    } else {
      this.container.focused.children.forEach((child: ElementView) => {
        child.style.strokeWidth = width;
      });
    }
    this.container.__call__(SVGEvent.STROKE_WIDTH_CHANGE, {strokeWidth: width});
  }

  public override get strokeDashArray(): string {
    return super.strokeDashArray;
  }
  public override set strokeDashArray(array: string) {
    super.strokeDashArray = array;
    if (this.container.focused.children.size === 0) {
      this.default.strokeDashArray = array;
    } else {
      this.container.focused.children.forEach((child: ElementView) => {
        child.style.strokeDashArray = array;
      });
    }
    this.container.__call__(SVGEvent.STROKE_DASH_ARRAY_CHANGE, {strokeDashArray: array});
  }

  public override get strokeColor(): string {
    return super.strokeColor;
  }
  public override set strokeColor(color: string) {
    super.strokeColor = color;
    if (this.container.focused.children.size === 0) {
      this.default.strokeColor = color;
    } else {
      this.container.focused.children.forEach((child: ElementView) => {
        child.style.strokeColor = color;
      });
    }
    this.container.__call__(SVGEvent.STROKE_COLOR_CHANGE, {strokeColor: color});
  }

  public override get fillColor(): string {
    return super.fillColor;
  }
  public override set fillColor(color: string) {
    super.fillColor = color;
    if (this.container.focused.children.size === 0) {
      this.default.fillColor = color;
    } else {
      this.container.focused.children.forEach((child: ElementView) => {
        child.style.fillColor = color;
      });
    }
    this.container.__call__(SVGEvent.FILL_COLOR_CHANGE, {fillColor: color});
  }

  public override get fontSize(): string {
    return super.fontSize;
  }
  public override set fontSize(size: string) {
    super.fontSize = size;
    if (this.container.focused.children.size === 0) {
      this.default.fontSize = size;
    } else {
      this.container.focused.children.forEach((child: ElementView) => {
        child.style.fontSize = size;
      });
    }
    this.container.__call__(SVGEvent.FONT_SIZE_CHANGE, {fontSizeMore: size});
  }

  public override get fontColor(): string {
    return super.fontColor;
  }
  public override set fontColor(color: string) {
    super.fontColor = color;
    if (this.container.focused.children.size === 0) {
      this.default.fontColor = color;
    } else {
      this.container.focused.children.forEach((child: ElementView) => {
        child.style.fontColor = color;
      });
    }
    this.container.__call__(SVGEvent.FONT_COLOR_CHANGE, {fontColor: color});
  }

  public override get backgroundColor(): string {
    return super.backgroundColor;
  }
  public override set backgroundColor(color: string) {
    super.backgroundColor = color;
    if (this.container.focused.children.size === 0) {
      this.default.backgroundColor = color;
    } else {
      this.container.focused.children.forEach((child: ElementView) => {
        child.style.backgroundColor = color;
      });
    }
    this.container.__call__(SVGEvent.FONT_BACKGROUND_CHANGE, {backgroundColor: color});
  }

  public resetToDefault(call: boolean = true): void {
    this.style.clear();
    this.default.clear();
    if (call) {
      this.container.__call__(SVGEvent.STYLE_CHANGE, {});
    }
  }

  public __recoverGlobalStyle__(call: boolean = true): void {
    this.__setGlobalStyle__(this.default, call);
  }
  public __fixGlobalStyle__(): void {
    this.default.strokeWidth = this.strokeWidth;
    this.default.strokeColor = this.strokeColor;
    this.default.fillColor = this.fillColor;
    this.default.fontSize = this.fontSize;
    this.default.fontColor = this.fontColor;
    this.default.backgroundColor = this.backgroundColor;
  }

  public __setGlobalStyle__(style: Style, call: boolean = true): void {
    super.strokeWidth = style.strokeWidth;
    super.strokeDashArray = style.strokeDashArray;
    super.strokeColor = style.strokeColor;
    super.fillColor = style.fillColor;
    super.fontSize = style.fontSize;
    super.fontColor = style.fontColor;
    super.backgroundColor = style.backgroundColor;
    if (call) {
      this.container.__call__(SVGEvent.STYLE_CHANGE, style.object);
    }
  }

  public changeCursor(cursorType: Cursor): void {
    this.container.HTML.style.cursor = this.container.style.cursor[cursorType];

    if (this.container.elements.size === 0) {
      if (!cursorType && cursorType !== 0) { /* cursorType can be 0 */
        cursorType = this.container.__activeCursor__;
      }
      this.container.__activeCursor__ = cursorType;
    } else {
      this.container.elements.forEach((element: ElementView) => {
        this.container.__setElementCursor__(element, cursorType);
      });
    }
  }
}

export class Container {
  private static allContainers: Container[] = [];
  private static nextContainerId: number = 0;

  private readonly container: HTMLElement;
  public readonly __elementsGroup__: SVGGElement;
  public readonly __pointersGroup__: SVGGElement;
  public readonly __nodesGroup__: SVGGElement;
  public readonly __highlightsGroup__: SVGGElement;
  public readonly __gridGroup__: SVGGElement;
  public readonly __focusGroup__: SVGGElement;

  /* Model */
  public readonly id: number;
  private readonly _focus: Focus;
  private _elements: Set<ElementView> = new Set<ElementView>();
  private _callBacks: Map<SVGEvent, SVGCallback[]> = new Map<SVGEvent, SVGCallback[]>();
  private _multiSelect: boolean = false;
  private _perfect: boolean = false;

  public readonly idPrefix: string;
  public readonly ownerId: string;
  private elementIndex: number;

  public readonly grid: Grid;
  public readonly style: GlobalStyle;
  public readonly drawers: Drawers;
  public readonly tools: Tools;
  public __activeCursor__: Cursor = Cursor.NO_TOOL;
  /* Model */

  public constructor(containerId: string, ownerId: string, idPrefix: string = '', elementIndex: number = 0) {
    this.idPrefix = idPrefix;
    this.ownerId = ownerId;
    this.elementIndex = elementIndex;

    const container: HTMLElement | null = document.getElementById(containerId);
    if (container) {
      this.container = container;
    } else {
      throw new DOMException('Can\'t create container', 'Container not found');
    }

    this.container.addEventListener('mousedown', (event: MouseEvent) => {
      if (event.target === this.container) {
        this.__call__(SVGEvent.CLICKED_ON_CONTAINER);
        this.blur();
      }
    });
    this.container.addEventListener('touchstart', (event: TouchEvent) => {
      if (event.target === this.container) {
        this.__call__(SVGEvent.CLICKED_ON_CONTAINER);
        this.blur();
      }
    });

    this.__elementsGroup__ = document.createElementNS(ElementView.svgURI, 'g');
    this.__elementsGroup__.id = 'elements';

    this.__pointersGroup__ = document.createElementNS(ElementView.svgURI, 'g');
    this.__pointersGroup__.id = 'pointers';

    this.__nodesGroup__ = document.createElementNS(ElementView.svgURI, 'g');
    this.__nodesGroup__.id = 'nodes';

    this.__highlightsGroup__ = document.createElementNS(ElementView.svgURI, 'g');
    this.__highlightsGroup__.id = 'highlight';

    this.__gridGroup__ = document.createElementNS(ElementView.svgURI, 'g');
    this.__gridGroup__.id = 'grid';

    this.__focusGroup__ = document.createElementNS(ElementView.svgURI, 'g');
    this.__focusGroup__.id = 'focus';

    this.container.appendChild(this.__gridGroup__); /* grid path */
    this.container.appendChild(this.__elementsGroup__); /* all elements */
    this.container.appendChild(this.__highlightsGroup__); /* highlight path */
    this.container.appendChild(this.__nodesGroup__); /* editing nodes */
    this.container.appendChild(this.__focusGroup__); /* bounding box, grips, rotation and reference point */
    this.container.appendChild(this.__pointersGroup__); /* all pointers */

    this.id = Container.nextContainerId;
    Container.allContainers[Container.nextContainerId] = this;
    Container.nextContainerId++;

    this.style = new GlobalStyle(this);
    this._focus = new Focus(this);
    this._focus.on();
    this.tools = new Tools(this);
    this.drawers = new Drawers(this.tools.drawTool);
    this.grid = new Grid(this);
    this.style = new GlobalStyle(this);
  }

  public static getById(id: number): Container {
    return Container.allContainers[id];
  }

  public get nextElementIndex(): number {
    return this.elementIndex++;
  }
  /**
   @param ownerId target element owner id
   @param index target element index
   @param deep for searching inside group elements also
   */
  public getElementById(ownerId: string, index: number, deep: boolean = false): ElementView | null {
    for (const element of this._elements) {
      if (deep && element instanceof GroupView) {
        /* if found element in group, return immediately, otherwise continue search */
        const foundElement: ElementView | undefined = element.getElementById(ownerId, index);
        if (foundElement) {
          return foundElement;
        }
      } else if (element.ownerId === ownerId && element.index === index) {
        return element;
      }
    }
    return null;
  }
  public createElementByType(type: ElementType): ElementView {
    switch (type) {
      case ElementType.BOX:
        return new BoxView(this);
      case ElementType.ELLIPSE:
        return new EllipseView(this);
      case ElementType.CIRCLE:
        return new CircleView(this);
      case ElementType.FOREIGN_OBJECT:
        return new ForeignObjectView(this);
      case ElementType.FREE:
        return new FreeView(this);
      case ElementType.LINE:
        return new LineView(this);
      case ElementType.PATH:
        return new PathView(this);
      case ElementType.POLYGON:
        return new PolygonView(this);
      case ElementType.POLYLINE:
        return new PolylineView(this);
      case ElementType.RECTANGLE:
        return new RectangleView(this);
      case ElementType.COORDINATE_PLANE:
        return new CoordinatePlaneView(this);
      case ElementType.COORDINATE_PLANE2:
        return new CoordinatePlaneView2(this);
      case ElementType.NUMBER_LINE:
        return new NumberLineView(this);
      case ElementType.NUMBER_LINE2:
        return new NumberLineView2(this);
      case ElementType.GRAPHIC:
        return new GraphicView(this, undefined, undefined, undefined, (x: number) => x);
      case ElementType.RAY:
        return new RayView(this);
      case ElementType.GROUP:
        return new GroupView(this);
      case ElementType.TRIANGLE:
        return new TriangleView(this);
      case ElementType.ISOSCELES_TRIANGLE:
        return new IsoscelesTriangleView(this);
      case ElementType.RIGHT_TRIANGLE:
        return new RightTriangleView(this);
      case ElementType.TEXT_BOX:
        return new TextBoxView(this);
      case ElementType.IMAGE:
        return new ImageView(this, undefined, '');
      case ElementType.VIDEO:
        return new VideoView(this, undefined, '');
      case ElementType.TABLE:
        return new TableView(this);
      default:
        throw Error('Unknown element type');
    }
  }
  public createElementFromJSON(elementJSON: any): ElementView {
    const element: ElementView = this.createElementByType(elementJSON.type);
    element.fromJSON(elementJSON);
    return element;
  }

  public __call__(name: SVGEvent, parameters: any = {}): void {
    const callbacks: SVGCallback[] | undefined = this._callBacks.get(name);
    if (callbacks) {
      callbacks.forEach((callback: SVGCallback) => {
        callback(parameters);
      });
    }
  }
  public addCallBack(name: SVGEvent, callback: SVGCallback): void {
    const callbacks: SVGCallback[] | undefined = this._callBacks.get(name);
    if (!callbacks) {
      this._callBacks.set(name, []);
    }

    this._callBacks.get(name)?.push(callback);
  }
  public removeCallBack(name: SVGEvent, callback: SVGCallback): void {
    const callbacks: SVGCallback[] | undefined = this._callBacks.get(name);
    if (callbacks) {
      callbacks.splice(callbacks.indexOf(callback), 1);
    }
  }

  public __setElementCursor__(element: ElementView, cursorType?: Cursor): void {
    let cursor: string;
    if (!cursorType && cursorType !== 0) { /* cursorType can be 0 */
      cursorType = this.__activeCursor__;
    }

    if (!element.selectable && this.style.cursor.element[element.type].cursor[cursorType] !== 'none' && (cursorType === Cursor.SELECT || cursorType === Cursor.NO_TOOL)) {
      cursorType = this.tools.activeTool?.cursor || Cursor.NO_TOOL;
      cursor = this.style.cursor[cursorType];
    } else if (this.style.cursor.element[element.type].cursor[cursorType]) {
      cursor = this.style.cursor.element[element.type].cursor[cursorType];
    } else { /* set container cursor if element cursor is not defined */
      cursor = this.HTML.style.cursor;
    }

    if (element instanceof GroupView) {
      element.elements.forEach((child: ElementView) => {
        this.__setElementCursor__(child, cursorType);
      });
    } else {
      element.cursor = cursor;
    }
    this.__activeCursor__ = cursorType;
  }

  private breakGroup(group: GroupView): Set<ElementView> {
    const children: Set<ElementView> = new Set();
    group.elements.forEach((child: ElementView) => {
      if (child instanceof GroupView) {
        this.breakGroup(child).forEach((childChild: ElementView) => {
          children.add(childChild);
        });
      } else {
        children.add(child);
      }
    });
    return children;
  }
  /* get all elements, if element is a group, then ungroup and get children */
  public get elementsDeep(): Set<ElementView> {
    const elements: Set<ElementView> = new Set();
    this._elements.forEach((element: ElementView) => {
      if (element instanceof GroupView) {
        this.breakGroup(element).forEach((child: ElementView) => {
          elements.add(child);
        });
      } else {
        elements.add(element);
      }
    });
    return elements;
  }
  public get elements(): Set<ElementView> {
    return this._elements;
  }
  public set elements(elements: Set<ElementView>) {
    this._elements = elements;
  }

  public add(element: ElementView, call: boolean = true): void {
    if (!element) {return;}

    element.group = null;
    /* appendChild creates new node if that node does not belong to any element, so the reference of element can be changed */
    element.SVG = this.__elementsGroup__.appendChild<SVGElement>(element.SVG);
    this._elements.add(element);

    this.__setElementCursor__(element /* this.activeTool?.cursor*/);

    if (call) {
      this.__call__(SVGEvent.ELEMENT_ADDED, {element});
    }
  }
  public remove(element: ElementView, force: boolean = false, call: boolean = true): void {
    /* if force don't check if select tool is on */
    if (force || this.tools.selectTool.isOn()) {
      const copy: ElementView = element.copy;
      element?.__remove__();
      this._elements.delete(element);

      if (call) {
        this.__call__(SVGEvent.ELEMENTS_DELETED, {elements: new Set<ElementView>([copy])});
      }
    }
  }
  public clear(): void {
    this._focus.clear();
    this._elements.clear();
    this.__elementsGroup__.innerHTML = '';
    this.tools.drawTool.stopDrawing(false);
  }

  public get HTML(): HTMLElement {
    return this.container;
  }

  public focusAll(showBounding: boolean = true, call: boolean = true): void {
    this.tools.selectTool.on();
    this._elements.forEach((element: ElementView) => {
      if (element.selectable) {
        this.focus(element, showBounding, true, false);
      }
    });
    if (call) {
      this.__call__(SVGEvent.ALL_FOCUSED, {elements: this._elements});
    }
  }
  public focus(element: ElementView, showBounding: boolean = true, changeGlobalStyle: boolean = true, call: boolean = true): void {
    if (element.selectable) {
      this._focus.appendChild(element, showBounding, changeGlobalStyle, call);
    }
  }
  public blur(element?: ElementView, call: boolean = true): void {
    if (element) {
      this._focus.removeChild(element, call);
    } else {
      this._focus.clear(call);
    }
  }

  public get focused(): Focus {
    return this._focus;
  }

  public get isMultiselect(): boolean {
    return this._multiSelect;
  }
  public multiSelect(): void {
    this._multiSelect = true;
    this._focus.boundingBox.__transparentClick__ = true;
  }
  public singleSelect(): void {
    this._multiSelect = false;
    this._focus.boundingBox.__transparentClick__ = false;
  }

  public get perfect(): boolean {
    return this._perfect;
  }
  public set perfect(perfect: boolean) {
    this._perfect = perfect;
    this.tools.drawTool.perfect = perfect;
    this._focus.boundingBox.perfect = perfect;
    if (perfect) {
      this.__call__(SVGEvent.PERFECT_MODE_ON);
    } else {
      this.__call__(SVGEvent.PERFECT_MODE_OFF);
    }
  }

  public static __eventToPosition__(event: MouseEvent | TouchEvent): Point {
    if (event instanceof MouseEvent) {
      return {
        x: event.clientX,
        y: event.clientY
      };
    } else if (event.touches[0]) {
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    } else { /* on touch end */
      return {
        x: event.changedTouches[0].pageX,
        y: event.changedTouches[0].pageY
      };
    }
  }
}
