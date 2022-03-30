import {Tool} from "../Tool";
import {TSVG} from "../../../TSVG";
import {PointedView} from "../../../element/shape/pointed/PointedView";
import {ElementView} from "../../../element/ElementView";
import {Point} from "../../../model/Point";
import {Node} from "./Node";
import {Callback} from "../../../dataSource/constant/Callback";
import {Focus} from "../../edit/group/Focus";
import {TextBoxView} from "../../../element/foreign/text/TextBoxView";
import {Cursor} from "../../../dataSource/constant/Cursor";
import {ForeignObjectView} from "../../../element/foreign/ForeignObjectView";

export class EditTool extends Tool {
  private readonly nodesGroup: SVGGElement;
  private nodes: Node[] = [];
  private _editableElement: PointedView | ForeignObjectView | null = null;
  public focus: Focus;

  public constructor(container: TSVG, focus: Focus) {
    super(container);
    this.nodesGroup = document.createElementNS(ElementView.svgURI, "g");
    this.nodesGroup.id = "nodes";
    this.focus = focus;
  }

  public makeMouseDown(position: Point, call: boolean, order: number) {
    this.nodes[order].makeMouseDown(position, call);
  }
  public makeMouseMove(position: Point, call: boolean, order: number) {
    this.nodes[order].makeMouseMove(position, call);
  }
  public makeMouseUp(position: Point, call: boolean, order: number) {
    this.nodes[order].makeMouseUp(position, call);
  }

  public set refPoint(refPoint: Point) {
    this.nodesGroup.style.transformOrigin = refPoint.x + "px " + refPoint.y + "px";
  }
  public rotate(angle: number) {
    this.nodesGroup.style.transform = "rotate(" + angle + "deg)";
  }

  public get SVG(): SVGGElement {
    return this.nodesGroup;
  }

  public get pointedEditableElement(): PointedView | null {
    if (this._editableElement instanceof PointedView) {
      return this._editableElement;
    }
    return null;
  }
  public get editableElement(): PointedView | ForeignObjectView  | null {
    return this._editableElement;
  }
  public set editableElement(editableElement: PointedView | ForeignObjectView | null) {
    if (!editableElement) return;

    this.focus.appendChild(editableElement, false, false);
    this._editableElement = editableElement;
    this._editableElement.onFocus();

    if (editableElement instanceof  PointedView) {
      let order = 0;
      let points = editableElement.points;
      for (let point of points) {
        let node: Node = new Node(this._container, this, point, order++);
        node.on();
        this.nodes.push(node);
        this.nodesGroup.appendChild(node.SVG);
      }

      this.refPoint = editableElement.refPoint;
      this.rotate(editableElement.angle);
    }
  }
  public removeEditableElement() {
    this.nodesGroup.innerHTML = "";
    this.nodes = [];
    if (!this._editableElement) return;

    this.focus.removeChild(this._editableElement, false);
    this._editableElement = null;
  }

  protected _on(call: boolean = true): void {
    this._isOn = true;
    for (let child of this.focus.children) {
      if (child instanceof PointedView) {
        this.editableElement = child;
        break;
      }
    }
    this._container.blur();
    if (this._editableElement)
      this._container.focus(this._editableElement, false);

    this._container.style.changeCursor(Cursor.EDIT);
    if (call) {
      this._container.call(Callback.EDIT_TOOl_ON);
    }
  }
  public off(call: boolean = true): void {
    this._isOn = false;
    this.focus.clear();
    this.removeEditableElement();

    if (call) {
      this._container.call(Callback.EDIT_TOOl_OFF);
    }
  }
}
