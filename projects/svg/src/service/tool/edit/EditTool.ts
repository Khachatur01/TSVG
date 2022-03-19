import {Tool} from "../Tool";
import {TSVG} from "../../../TSVG";
import {PointedView} from "../../../element/shape/pointed/PointedView";
import {ElementView} from "../../../element/ElementView";
import {Point} from "../../../model/Point";
import {Node} from "./Node";
import {Callback} from "../../../dataSource/constant/Callback";
import {Focus} from "../../edit/group/Focus";

export class EditTool extends Tool {
  private readonly nodesGroup: SVGGElement;
  private nodes: Node[] = [];
  private _editableElement: PointedView | null = null;
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

  public get editableElement(): PointedView | null {
    return this._editableElement;
  }
  public set editableElement(editableElement: PointedView | null) {
    if (!editableElement) return;
    this.focus.appendChild(editableElement, false);
    this._editableElement = editableElement;
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
  public removeEditableElement() {
    this._editableElement = null;
    this.nodesGroup.innerHTML = "";
    this.nodes = [];
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
    this._container.HTML.style.cursor = "default";

    if (call) {
      this._container.call(Callback.EDIT_TOOl_ON);
    }
  }
  public off(call: boolean = true): void {
    this._isOn = false;
    this.removeEditableElement();
    this._container.blur();

    if (call) {
      this._container.call(Callback.EDIT_TOOl_OFF);
    }
  }
}
