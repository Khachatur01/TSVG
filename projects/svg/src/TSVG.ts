import {DrawTool} from "./service/tool/draw/DrawTool";
import {ElementCursor, ElementView} from "./element/ElementView";
import {Focus} from "./service/edit/group/Focus";
import {SelectTool} from "./service/tool/select/SelectTool";
import {Tool} from "./service/tool/Tool";
import {EditTool} from "./service/tool/edit/EditTool";
import {DrawTools} from "./dataSource/DrawTools";
import {Grid} from "./service/grid/Grid";
import {Callback} from "./dataSource/constant/Callback";
import {GroupCursor, GroupView} from "./element/group/GroupView";
import {PointedView} from "./element/shape/pointed/PointedView";
import {Style} from "./service/style/Style";
import {HighlightTool} from "./service/tool/highlighter/HighlightTool";
import {PointerTool} from "./service/tool/pointer/PointerTool";
import {Point} from "./model/Point";
import {TextBoxCursor, TextBoxView} from "./element/foreign/text/TextBoxView";
import {Cursor} from "./dataSource/constant/Cursor";
import {ForeignObjectCursor, ForeignObjectView} from "./element/foreign/ForeignObjectView";
import {ElementType} from "./dataSource/constant/ElementType";
import {EllipseCursor} from "./element/shape/EllipseView";
import {BoxCursor} from "./element/shape/BoxView";
import {PathCursor} from "./element/shape/pointed/PathView";
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
import {GraphicCursor} from "./element/foreign/graphic/GraphicView";

class GlobalStyle extends Style {
  private readonly default: Style;
  private container: TSVG;

  public readonly cursor: any = {
    element: {}
  };

  public constructor(container: TSVG) {
    super();
    this.container = container;
    this.default = new Style();

    this.cursor[Cursor.DRAW] = "crosshair";
    this.cursor[Cursor.DRAW_FREE] = "crosshair";
    this.cursor[Cursor.SELECT] = "default";
    this.cursor[Cursor.EDIT] = "default";
    this.cursor[Cursor.POINTER] = "none";
    this.cursor[Cursor.HIGHLIGHTER] = "crosshair";
    this.cursor[Cursor.BOUNDING_BOX] = "move";
    this.cursor[Cursor.GRIP] = "crosshair";
    this.cursor[Cursor.REFERENCE_POINT] = "crosshair";
    this.cursor[Cursor.ROTATE_POINT] = "crosshair";
    this.cursor[Cursor.NODE] = "move";

    this.cursor.element[ElementType.ELLIPSE] = new EllipseCursor();
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
    this.cursor.element[ElementType.GRAPHIC] = new GraphicCursor();
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
    this.container.call(Callback.STROKE_WIDTH_CHANGE, {strokeWidth: width});
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
    this.container.call(Callback.STROKE_DASH_ARRAY_CHANGE, {strokeDashArray: array});
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
    this.container.call(Callback.STROKE_COLOR_CHANGE, {strokeColor: color});
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
    this.container.call(Callback.FILL_COLOR_CHANGE, {fillColor: color});
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
    this.container.call(Callback.FONT_SIZE_CHANGE, {fontSize: size});
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
    this.container.call(Callback.FONT_COLOR_CHANGE, {fontColor: color});
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
    this.container.call(Callback.FONT_BACKGROUND_CHANGE, {backgroundColor: color});
  }

  public recoverGlobalStyle(call: boolean = true) {
    this.setGlobalStyle(this.default, call);
  }
  public fixGlobalStyle() {
    this.default.strokeWidth = this.strokeWidth;
    this.default.strokeColor = this.strokeColor;
    this.default.fillColor = this.fillColor;
    this.default.fontSize = this.fontSize;
    this.default.fontColor = this.fontColor;
    this.default.backgroundColor = this.backgroundColor;
  }

  public setGlobalStyle(style: Style, call: boolean = true) {
    super.strokeWidth = style.strokeWidth;
    super.strokeColor = style.strokeColor;
    super.fillColor = style.fillColor;
    super.fontSize = style.fontSize;
    super.fontColor = style.fontColor;
    super.backgroundColor = style.backgroundColor;
    if (call) {
      this.container.call(Callback.STYLE_CHANGE, style.object);
    }
  }

  public changeCursor(tool: Cursor) {
    this.container.HTML.style.cursor = this.container.style.cursor[tool];
    this.container.elements.forEach((element: ElementView) => {
      let cursor;

      if (this.cursor.element[element.type].cursor[tool]) {
        cursor = this.cursor.element[element.type].cursor[tool];
      } else { /* set container cursor if element cursor is not defined */
        cursor = this.container.HTML.style.cursor;
      }

      element.SVG.style.cursor = cursor;
      if (element instanceof ForeignObjectView && element.content) { /* is element is foreign object and has content, set cursor also for content */
        element.content.style.cursor = cursor;
      }
    });
  }
}

class Clipboard {
  private text: string = "";
  public set(text: string) {
    this.text = text;
  }
  public get(): string {
    return this.text;
  }
}

export class TSVG {
  private readonly container: HTMLElement;
  private readonly _focus: Focus;
  private _elements: Set<ElementView> = new Set<ElementView>();
  private _callBacks: Map<Callback, Function[]> = new Map<Callback, Function[]>();
  private _multiSelect: boolean = false;
  private _perfect: boolean = false;

  public readonly idPrefix: string;
  public readonly ownerId: string;
  private elementIndex: number;

  public readonly elementsGroup: SVGGElement;

  /* tools */
  public readonly selectTool: SelectTool;
  public readonly highlightTool: HighlightTool;
  public readonly pointerTool: PointerTool;
  public readonly drawTool: DrawTool;
  public readonly editTool: EditTool;
  /* tools */

  public readonly grid: Grid;
  public readonly style: GlobalStyle = new GlobalStyle(this);
  public readonly drawTools: DrawTools = new DrawTools(this);
  public activeTool: Tool;

  public clipboard: Clipboard = new Clipboard();

  public constructor(containerId: string, ownerId: string, idPrefix: string = "", elementIndex: number = 0) {
    this.idPrefix = idPrefix;
    this.ownerId = ownerId;
    this.elementIndex = elementIndex;

    let container = document.getElementById(containerId);
    if (container)
      this.container = container;
    else
      throw new DOMException("Can't create container", "Container not found");

    this._focus = new Focus(this);
    this._focus.on();
    this.drawTool = new DrawTool(this);
    this.highlightTool = new HighlightTool(this);
    this.pointerTool = new PointerTool(this, "");
    this.selectTool = new SelectTool(this, this._focus);
    this.editTool = new EditTool(this, this._focus);
    this.activeTool = this.selectTool;
    this.grid = new Grid(this);
    this.style = new GlobalStyle(this);

    this.container.addEventListener("mousedown", event => {
      if (event.target == this.container) {
        this.blur();
        this.editTool.removeEditableElement();
      }
    });
    this.container.addEventListener("touchmove", event => {
      if (event.target == this.container) {
        this.blur();
        this.editTool.removeEditableElement();
      }
    });

    this.elementsGroup = document.createElementNS(ElementView.svgURI, "g");
    this.elementsGroup.id = "elements";

    this.container.appendChild(this.grid.group); /* grid path */
    this.container.appendChild(this.elementsGroup); /* all elements */
    this.container.appendChild(this.highlightTool.SVG); /* highlight path */
    this.container.appendChild(this.editTool.SVG); /* editing nodes */
    this.container.appendChild(this._focus.SVG); /* bounding box, grips, rotation and reference point */
    this.container.appendChild(this.pointerTool.SVG); /* pointer image */
  }

  public get nextElementIndex(): number {
    return this.elementIndex++;
  }
  public getElementsByOwnerId(ownerId: string): ElementView[] {
    let elements: ElementView[] = [];
    this._elements.forEach((element: ElementView) => {
      if (element.ownerId === ownerId) {
        elements.push(element);
      }
    });
    return elements;
  }
  public getElementById(ownerId: string, index: number): ElementView | undefined {
    for (let element of this._elements) {
      if (element.ownerId === ownerId && element.index === index) {
        return element;
      }
    }
    return undefined;
  }

  public call(name: Callback, parameters: any = {}): void {
    let callback = this._callBacks.get(name);
    if (callback)
      callback.forEach((func: Function) => {
        func(parameters);
      });
  }
  public addCallBack(name: Callback, callback: Function) {
    let functions = this._callBacks.get(name);
    if (!functions)
      this._callBacks.set(name, []);

    this._callBacks.get(name)?.push(callback)
  }
  public removeCallBack(name: Callback, callback: Function) {
    let functions = this._callBacks.get(name);
    if (functions)
      functions.splice(functions.indexOf(callback), 1);
  }

  private clickEvent(element: ElementView) {
    if (!this.selectTool.isOn() && !this.editTool.isOn())
      return;

    if (this.editTool.isOn()) {
      this.editTool.removeEditableElement();
      if (element instanceof PointedView || element instanceof ForeignObjectView) {
        this.editTool.editableElement = element;
      }
    } else {
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
  }
  public setElementActivity(element: ElementView) {
    if (element instanceof GroupView) return;
    element.SVG.addEventListener("mousedown", () => {
      this.clickEvent(element);
    });
    element.SVG.addEventListener("touchstart", () => {
      this.clickEvent(element);
    });
  }

  public get elements(): Set<ElementView> {
    return this._elements;
  }

  public add(element: ElementView, setElementActivity: boolean = true) {
    if (!element) return;
    element.group = null;
    this.elementsGroup.appendChild(element.SVG);
    this._elements.add(element);
    if(setElementActivity)
      this.setElementActivity(element);
  }
  public remove(element: ElementView, force: boolean = false, call: boolean = true) {
    if (force || this.selectTool.isOn()) { /* if force don't check if select tool is on */
      this._elements.delete(element);
      element.remove();

      if (call) {
        this.call(Callback.ELEMENT_DELETED, {elements: new Set<ElementView>([element])});
      }
    }
  }
  public clear() {
    this._focus.clear();
    this._elements.clear();
    this.elementsGroup.innerHTML = "";
  }

  public get HTML(): HTMLElement {
    return this.container;
  }

  public focusAll(showBounding: boolean = true) {
    this.selectTool.on();
    this._elements.forEach((element: ElementView) => {
      this.focus(element, showBounding);
    });
  }
  public focus(element: ElementView, showBounding: boolean = true, call: boolean = true) {
    this._focus.appendChild(element, showBounding, call);
  }
  public blur(element: ElementView | null = null) {
    if (element)
      this._focus.removeChild(element);
    else
      this._focus.clear();
  }

  public get focused(): Focus {
    return this._focus;
  }

  public multiSelect(): void {
    this._multiSelect = true;
    this._focus.boundingBox.transparentClick = true;
  }
  public singleSelect(): void {
    this._multiSelect = false;
    this._focus.boundingBox.transparentClick = false;
  }

  public get perfect(): boolean {
    return this._perfect;
  }
  public set perfect(perfect: boolean) {
    this._perfect = perfect;
    this.drawTool.perfect = perfect;
    if (perfect)
      this.call(Callback.PERFECT_MODE_ON);
    else
      this.call(Callback.PERFECT_MODE_OFF);
  }

  public static eventToPosition(event: MouseEvent | TouchEvent): Point {
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
