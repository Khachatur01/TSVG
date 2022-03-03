import {DrawTool} from "./service/tool/draw/DrawTool";
import {ElementView} from "./element/ElementView";
import {Focus} from "./service/edit/group/Focus";
import {SelectTool} from "./service/tool/select/SelectTool";
import {Tool} from "./service/tool/Tool";
import {EditTool} from "./service/tool/edit/EditTool";
import {DrawTools} from "./dataSource/DrawTools";
import {Grid} from "./service/grid/Grid";
import {Callback} from "./dataSource/Callback";
import {GroupView} from "./element/group/GroupView";
import {PointedView} from "./element/shape/pointed/PointedView";
import {ElementsClipboard} from "./dataSource/ElementsClipboard";
import {Style} from "./service/style/Style";
import {HighlightTool} from "./service/tool/highlighter/HighlightTool";
import {PointerTool} from "./service/tool/pointer/PointerTool";
import {Point} from "./model/Point";
import {TextBoxView} from "./element/foreign/text/TextBoxView";

class GlobalStyle extends Style {
  private readonly default: Style;
  private container: TSVG;

  public constructor(container: TSVG) {
    super();
    this.container = container;
    this.default = new Style();
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
    this.container.call(Callback.STYLE_CHANGE, this.object);
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
    this.container.call(Callback.STYLE_CHANGE, this.object);
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
    this.container.call(Callback.STYLE_CHANGE, this.object);
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
    this.container.call(Callback.STYLE_CHANGE, this.object);
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
    this.container.call(Callback.STYLE_CHANGE, this.object);
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
    this.container.call(Callback.STYLE_CHANGE, this.object);
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
    this.container.call(Callback.STYLE_CHANGE, this.object);
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
}

export interface MouseEventSwitches {
  draw: boolean,
  drag: boolean,
  resize: boolean,
  rotate: boolean,
  refPoint: boolean,
  nodeEdit: boolean,
  elementSelectBlur: boolean,
  areaSelect: boolean,
  blurAll: boolean,
  highlight: boolean,
  pointer: boolean
}

export class TSVG {
  private readonly container: HTMLElement;
  public readonly mouseEventSwitches: MouseEventSwitches = {
    draw: true,
    drag: true,
    resize: true,
    rotate: true,
    refPoint: true,
    nodeEdit: true,
    elementSelectBlur: true,
    areaSelect: true,
    blurAll: true,
    highlight: true,
    pointer: true
  };

  private _focus: Focus = new Focus(this);
  private _elements: Set<ElementView> = new Set<ElementView>();
  private _callBacks: Map<Callback, Function[]> = new Map<Callback, Function[]>();
  private _multiSelect: boolean = false;
  private lastCopyPosition: Point = {x: 0, y: 0};
  private readonly idPrefix: string;
  private static id: number = 0;
  private _perfect: boolean = false;

  public readonly elementsGroup: SVGGElement;
  public readonly selectTool: SelectTool;
  public readonly highlightTool: HighlightTool;
  public readonly pointerTool: PointerTool;
  public readonly drawTool: DrawTool;
  public readonly editTool: EditTool;
  public readonly grid: Grid;
  public readonly style: GlobalStyle = new GlobalStyle(this);
  public readonly drawTools: DrawTools = new DrawTools(this);
  public activeTool: Tool;

  public constructor(containerId: string, idPrefix: string = "element") {
    let container = document.getElementById(containerId);
    if (container)
      this.container = container;
    else
      throw new DOMException("Can't create container", "Container not found");

    this.idPrefix = idPrefix;

    this.drawTool = new DrawTool(this);
    this.highlightTool = new HighlightTool(this);
    this.pointerTool = new PointerTool(this);
    this.selectTool = new SelectTool(this);
    this.editTool = new EditTool(this);
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
    this._focus.SVG.style.cursor = "move";

    this.container.appendChild(this.grid.group); /* grid path */
    this.container.appendChild(this.elementsGroup); /* all elements */
    this.container.appendChild(this.highlightTool.SVG); /* highlight path */
    this.container.appendChild(this.editTool.SVG); /* editing nodes */
    this.container.appendChild(this._focus.SVG); /* bounding box, grips, rotation and reference point */
  }

  public get id(): number {
    return TSVG.id;
  }
  public set id(id: number) {
    TSVG.id = id;
  }
  public get nextId(): string {
    return this.idPrefix + TSVG.id++;
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

    this.editTool.removeEditableElement();

    if (this.editTool.isOn()) {
      if (element instanceof PointedView)
        this.editTool.editableElement = element;
      else if (element instanceof TextBoxView)
        this.focus(element, false);
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
  private setElementActivity(element: ElementView) {
    if (element instanceof GroupView) return;
    element.SVG.addEventListener("mousedown", () => {
      this.clickEvent(element);
    });
    element.SVG.addEventListener("touchstart", () => {
      this.clickEvent(element);
    });

    element.SVG.addEventListener("mousemove", () => {
      if (this.selectTool.isOn())
        element.SVG.style.cursor = element.style.cursor.select;
      else if (this.editTool.isOn())
        element.SVG.style.cursor = element.style.cursor.edit;
    });
  }

  public get elements(): Set<ElementView> {
    return this._elements;
  }

  public add(xElement: ElementView, setElementActivity: boolean = true) {
    if (!xElement) return;
    xElement.group = null;
    this.elementsGroup.appendChild(xElement.SVG);
    this._elements.add(xElement);
    if(setElementActivity)
      this.setElementActivity(xElement);
  }
  public remove(xElement: ElementView) {
    this._elements.delete(xElement);
    xElement.remove();
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
  public focus(xElement: ElementView, showBounding: boolean = true) {
    this._focus.appendChild(xElement, showBounding);
  }
  public blur(xElement: ElementView | null = null) {
    if (xElement)
      this._focus.removeChild(xElement);
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
  public copyFocused(): void {
    let elements: ElementView[] = [];
    for (let element of this._focus.children)
      elements.push(element);

    this.lastCopyPosition = this._focus.position;
    ElementsClipboard.save(elements);
    this.call(Callback.COPY);
  }
  public cutFocused(): void {
    this.copyFocused();
    this._focus.remove();
    this.call(Callback.CUT);
  }
  public paste(): void {
    let elements: ElementView[] = ElementsClipboard.get();

    this.blur();
    elements.forEach((element: ElementView) => {
      element = element.copy; /* may paste many times */
      element.container = this;
      element.fixRect();
      if (element instanceof GroupView)
        element.elements.forEach((child: ElementView) => {
          this.setElementActivity(child);
          child.container = this;
        });

      let oldPosition = element.position;
      element.position = {
        x: this.lastCopyPosition.x - oldPosition.x + 10,
        y: this.lastCopyPosition.y - oldPosition.y + 10
      };
      this.lastCopyPosition = element.position;
      this.add(element);
      this.focus(element);
    });
    this.call(Callback.PASTE);
  }

  public get perfect(): boolean {
    return this._perfect;
  }
  public set perfect(perfect: boolean) {
    this._perfect = perfect;
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
