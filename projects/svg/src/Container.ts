import {ElementView} from "./element/ElementView";
import {Focus} from "./service/edit/group/Focus";
import {Drawers} from "./dataSource/Drawers";
import {Grid} from "./service/grid/Grid";
import {Event} from "./dataSource/constant/Event";
import {GroupCursor, GroupView} from "./element/group/GroupView";
import {Style} from "./service/style/Style";
import {Point} from "./model/Point";
import {TextBoxCursor} from "./element/foreign/text/TextBoxView";
import {Cursor} from "./dataSource/constant/Cursor";
import {ForeignObjectCursor} from "./element/foreign/ForeignObjectView";
import {ElementType} from "./dataSource/constant/ElementType";
import {EllipseCursor} from "./element/shape/circluar/EllipseView";
import {BoxCursor} from "./element/shape/BoxView";
import {PathCursor} from "./element/shape/PathView";
import {LineCursor} from "./element/shape/pointed/LineView";
import {FreeCursor} from "./element/shape/pointed/polyline/FreeView";
import {PolylineCursor} from "./element/shape/pointed/polyline/PolylineView";
import {PolygonCursor} from "./element/shape/pointed/polygon/PolygonView";
import {TriangleCursor} from "./element/shape/pointed/polygon/triangle/TriangleView";
import {RightTriangleCursor} from "./element/shape/pointed/polygon/triangle/RightTriangleView";
import {IsoscelesTriangleCursor} from "./element/shape/pointed/polygon/triangle/IsoscelesTriangleView";
import {RectangleCursor} from "./element/shape/pointed/polygon/rectangle/RectangleView";
import {ImageCursor} from "./element/foreign/media/ImageView";
import {VideoCursor} from "./element/foreign/media/VideoView";
import {CoordinatePlaneCursor} from "./element/complex/cartesian/CoordinatePlaneView";
import {CircleCursor} from "./element/shape/circluar/CircleView";
import {TableCursor} from "./element/complex/TableView";
import {Tools} from "./dataSource/Tools";
import {NumberLineCursor} from "./element/complex/cartesian/NumberLineView";
import {RayCursor} from "./element/complex/cartesian/RayView";
import {GraphicCursor} from "./element/complex/cartesian/GraphicView";

class GlobalStyle extends Style {
  private readonly default: Style;
  private container: Container;

  public readonly cursor: any = {
    element: {}
  };

  public constructor(container: Container) {
    super();
    this.container = container;
    this.default = new Style();

    this.cursor[Cursor.NO_TOOL] = "default";
    this.cursor[Cursor.DRAW] = "crosshair";
    this.cursor[Cursor.DRAW_FREE] = "crosshair";
    this.cursor[Cursor.DRAW_TEXT_BOX] = "crosshair";
    this.cursor[Cursor.SELECT] = "default";
    this.cursor[Cursor.EDIT_NODE] = "default";
    this.cursor[Cursor.EDIT_TABLE] = "default";
    this.cursor[Cursor.POINTER] = "none";
    this.cursor[Cursor.HIGHLIGHTER] = "crosshair";
    this.cursor[Cursor.BOUNDING_BOX] = "move";
    this.cursor[Cursor.GRIP] = "crosshair";
    this.cursor[Cursor.REFERENCE_POINT] = "crosshair";
    this.cursor[Cursor.ROTATE_POINT] = "crosshair";
    this.cursor[Cursor.NODE] = "move";

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
    this.cursor.element[ElementType.NUMBER_LINE] = new NumberLineCursor();
    this.cursor.element[ElementType.TABLE] = new TableCursor();
  }

  public override get strokeWidth(): string {
    return super.strokeWidth;
  }
  public override set strokeWidth(width: string) {
    super.strokeWidth = width;
    if (this.container.focused.children.size == 0) {
      this.default.strokeWidth = width;
    } else {
      this.container.focused.children.forEach((child: ElementView) => {
        child.style.strokeWidth = width;
      });
    }
    this.container.__call__(Event.STROKE_WIDTH_CHANGE, {strokeWidth: width});
  }

  public override get strokeDashArray(): string {
    return super.strokeDashArray;
  }
  public override set strokeDashArray(array: string) {
    super.strokeDashArray = array;
    if (this.container.focused.children.size == 0) {
      this.default.strokeDashArray = array;
    } else {
      this.container.focused.children.forEach((child: ElementView) => {
        child.style.strokeDashArray = array;
      });
    }
    this.container.__call__(Event.STROKE_DASH_ARRAY_CHANGE, {strokeDashArray: array});
  }

  public override get strokeColor(): string {
    return super.strokeColor;
  }
  public override set strokeColor(color: string) {
    super.strokeColor = color;
    if (this.container.focused.children.size == 0) {
      this.default.strokeColor = color;
    } else {
      this.container.focused.children.forEach((child: ElementView) => {
        child.style.strokeColor = color;
      });
    }
    this.container.__call__(Event.STROKE_COLOR_CHANGE, {strokeColor: color});
  }

  public override get fillColor(): string {
    return super.fillColor;
  }
  public override set fillColor(color: string) {
    super.fillColor = color;
    if (this.container.focused.children.size == 0) {
      this.default.fillColor = color;
    } else {
      this.container.focused.children.forEach((child: ElementView) => {
        child.style.fillColor = color;
      });
    }
    this.container.__call__(Event.FILL_COLOR_CHANGE, {fillColor: color});
  }

  public override get fontSize(): string {
    return super.fontSize;
  }
  public override set fontSize(size: string) {
    super.fontSize = size;
    if (this.container.focused.children.size == 0) {
      this.default.fontSize = size;
    } else {
      this.container.focused.children.forEach((child: ElementView) => {
        child.style.fontSize = size;
      });
    }
    this.container.__call__(Event.FONT_SIZE_CHANGE, {fontSize: size});
  }

  public override get fontColor(): string {
    return super.fontColor;
  }
  public override set fontColor(color: string) {
    super.fontColor = color;
    if (this.container.focused.children.size == 0) {
      this.default.fontColor = color;
    } else {
      this.container.focused.children.forEach((child: ElementView) => {
        child.style.fontColor = color;
      });
    }
    this.container.__call__(Event.FONT_COLOR_CHANGE, {fontColor: color});
  }

  public override get backgroundColor(): string {
    return super.backgroundColor;
  }
  public override set backgroundColor(color: string) {
    super.backgroundColor = color;
    if (this.container.focused.children.size == 0) {
      this.default.backgroundColor = color;
    } else {
      this.container.focused.children.forEach((child: ElementView) => {
        child.style.backgroundColor = color;
      });
    }
    this.container.__call__(Event.FONT_BACKGROUND_CHANGE, {backgroundColor: color});
  }

  public resetToDefault(call: boolean = true): void {
    this.style.clear();
    this.default.clear();
    if (call) {
      this.container.__call__(Event.STYLE_CHANGE, {});
    }
  }

  public __recoverGlobalStyle__(call: boolean = true) {
    this.__setGlobalStyle__(this.default, call);
  }
  public __fixGlobalStyle__() {
    this.default.strokeWidth = this.strokeWidth;
    this.default.strokeColor = this.strokeColor;
    this.default.fillColor = this.fillColor;
    this.default.fontSize = this.fontSize;
    this.default.fontColor = this.fontColor;
    this.default.backgroundColor = this.backgroundColor;
  }

  public __setGlobalStyle__(style: Style, call: boolean = true) {
    super.strokeWidth = style.strokeWidth;
    super.strokeDashArray = style.strokeDashArray;
    super.strokeColor = style.strokeColor;
    super.fillColor = style.fillColor;
    super.fontSize = style.fontSize;
    super.fontColor = style.fontColor;
    super.backgroundColor = style.backgroundColor;
    if (call) {
      this.container.__call__(Event.STYLE_CHANGE, style.object);
    }
  }

  public changeCursor(cursorType: Cursor) {
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
  private static nextContainerId = 0;

  private readonly container: HTMLElement;
  public readonly __elementsGroup__: SVGGElement;
  public readonly __pointersGroup__: SVGGElement;
  public readonly __nodesGroup__: SVGGElement;

  /* Model */
  public readonly id: number;
  private readonly _focus: Focus;
  private _elements: Set<ElementView> = new Set<ElementView>();
  private _callBacks: Map<Event, Function[]> = new Map<Event, Function[]>();
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

  public constructor(containerId: string, ownerId: string, idPrefix: string = "", elementIndex: number = 0) {
    this.idPrefix = idPrefix;
    this.ownerId = ownerId;
    this.elementIndex = elementIndex;

    let container = document.getElementById(containerId);
    if (container)
      this.container = container;
    else
      throw new DOMException("Can't create container", "Container not found");

    this.style = new GlobalStyle(this);
    this._focus = new Focus(this);
    this._focus.on();
    this.drawers = new Drawers(this);
    this.tools = new Tools(this);
    this.grid = new Grid(this);
    this.style = new GlobalStyle(this);

    this.container.addEventListener("mousedown", event => {
      if (event.target == this.container && !this.tools.drawTool.isOn()) {
        if (this.tools.editNodeTool.isOn() || this.tools.editTableTool.isOn()) {
          this.tools.drawTool.drawer = this.drawers.free;
          this.tools.drawTool.on();
        }
        this.blur();
      }
    });
    this.container.addEventListener("touchstart", event => {
      if (event.target == this.container && !this.tools.drawTool.isOn()) {
        if (this.tools.editNodeTool.isOn() || this.tools.editTableTool.isOn()) {
          this.tools.drawTool.drawer = this.drawers.free;
          this.tools.drawTool.on();
        }
        this.blur();
      }
    });

    this.__elementsGroup__ = document.createElementNS(ElementView.svgURI, "g");
    this.__elementsGroup__.id = "elements";

    this.__pointersGroup__ = document.createElementNS(ElementView.svgURI, "g");
    this.__pointersGroup__.id = "pointers";

    this.__nodesGroup__ = document.createElementNS(ElementView.svgURI, "g");
    this.__nodesGroup__.id = "nodes";

    this.container.appendChild(this.grid.__group__); /* grid path */
    this.container.appendChild(this.__elementsGroup__); /* all elements */
    this.container.appendChild(this.tools.highlightTool.SVG); /* highlight path */
    this.container.appendChild(this.__nodesGroup__); /* editing nodes */
    this.container.appendChild(this._focus.SVG); /* bounding box, grips, rotation and reference point */
    this.container.appendChild(this.__pointersGroup__); /* all pointers */

    this.id = Container.nextContainerId
    Container.allContainers[Container.nextContainerId] = this;
    Container.nextContainerId++;
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
  public getElementById(ownerId: string, index: number, deep: boolean = false): ElementView | undefined {
    for (let element of this._elements) {
      if (deep && element instanceof GroupView) {
        return element.getElementById(ownerId, index);
      } else if (element.ownerId === ownerId && element.index === index) {
        return element;
      }
    }
    return undefined;
  }

  public __call__(name: Event, parameters: any = {}): void {
    let callback = this._callBacks.get(name);
    if (callback)
      callback.forEach((func: Function) => {
        func(parameters);
      });
  }
  public addCallBack(name: Event, callback: Function) {
    let functions = this._callBacks.get(name);
    if (!functions)
      this._callBacks.set(name, []);

    this._callBacks.get(name)?.push(callback)
  }
  public removeCallBack(name: Event, callback: Function) {
    let functions = this._callBacks.get(name);
    if (functions)
      functions.splice(functions.indexOf(callback), 1);
  }

  private clickEvent(element: ElementView) {
    if (this.tools.editNodeTool.isOn() && this.tools.editNodeTool.editableElement != element) {
      this.blur();
      if (this.tools.editNodeTool.isOn()) {
        this.tools.drawTool.drawer = this.drawers.free;
        this.tools.drawTool.on();
      }
      return;
    }
    if (!this.tools.selectTool.isOn()) {
      return;
    }

    if (element.group) /* if element has grouped, then select group */
      element = element.group;

    let hasChild = this._focus.hasChild(element);
    if (!this._multiSelect && hasChild) return;

    if (!this._multiSelect && !hasChild) {
      this.blur();
      this.focus(element);
    } else if (hasChild) {
      this.blur(element);
    } else {
      this.focus(element);
    }
  }
  public __setElementActivity__(element: ElementView) {
    if (element instanceof GroupView) return;
    element.SVG.addEventListener("mousedown", () => {
      this.clickEvent(element);
    });
    element.SVG.addEventListener("touchstart", () => {
      this.clickEvent(element);
    });
  }

  public __setElementCursor__(element: ElementView, cursorType?: Cursor): void {
    let cursor: string;
    if (!cursorType && cursorType !== 0) { /* cursorType can be 0 */
      cursorType = this.__activeCursor__;
    }

    if (!element.selectable && this.style.cursor.element[element.type].cursor[cursorType] != "none" && (cursorType === Cursor.SELECT || cursorType === Cursor.NO_TOOL)) {
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

  public get elements(): Set<ElementView> {
    return this._elements;
  }
  public set elements(elements: Set<ElementView>) {
    this._elements = elements;
  }

  public add(element: ElementView, setElementActivity: boolean = true) {
    if (!element) return;
    element.group = null;
    this.__elementsGroup__.appendChild(element.SVG);
    this._elements.add(element);
    if(setElementActivity) {
      this.__setElementActivity__(element);
    }

    this.__setElementCursor__(element /* this.activeTool?.cursor*/);
  }
  public remove(element: ElementView, force: boolean = false, call: boolean = true) {
    if (force || this.tools.selectTool.isOn()) { /* if force don't check if select tool is on */
      element?.__remove__();
      this._elements.delete(element);

      if (call) {
        this.__call__(Event.ELEMENTS_DELETED, {elements: new Set<ElementView>([element])});
      }
    }
  }
  public clear() {
    this._focus.clear();
    this._elements.clear();
    this.__elementsGroup__.innerHTML = "";
    this.tools.drawTool.stopDrawing(false);
  }

  public get HTML(): HTMLElement {
    return this.container;
  }

  public focusAll(showBounding: boolean = true, call: boolean = true) {
    this.tools.selectTool.on();
    this._elements.forEach((element: ElementView) => {
      if (element.selectable) {
        this.focus(element, showBounding, true, false);
      }
    });
    if (call) {
      this.__call__(Event.ALL_FOCUSED, {elements: this._elements});
    }
  }
  public focus(element: ElementView, showBounding: boolean = true, changeGlobalStyle: boolean = true, call: boolean = true) {
    if (element.selectable) {
      this._focus.appendChild(element, showBounding, changeGlobalStyle, call);
    }
  }
  public blur(element?: ElementView, call: boolean = true) {
    if (element) {
      this._focus.removeChild(element, call);
    } else {
      this._focus.clear(call);
    }
  }

  public get focused(): Focus {
    return this._focus;
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
    if (perfect)
      this.__call__(Event.PERFECT_MODE_ON);
    else
      this.__call__(Event.PERFECT_MODE_OFF);
  }

  public static __eventToPosition__(event: MouseEvent | TouchEvent): Point {
    if (event instanceof MouseEvent) {
      return {
        x: event.clientX,
        y: event.clientY
      };
    } else if(event.touches[0])
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    else { /* on touch end */
      return {
        x: event.changedTouches[0].pageX,
        y: event.changedTouches[0].pageY
      };
    }
  }
}
