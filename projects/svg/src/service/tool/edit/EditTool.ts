import {Tool} from "../Tool";
import {TSVG} from "../../../TSVG";
import {PointedView} from "../../../element/shape/pointed/PointedView";
import {ElementView} from "../../../element/ElementView";
import {Point} from "../../../model/Point";
import {Node} from "./Node";
import {Callback} from "../../../dataSource/Callback";

export class EditTool extends Tool {
  private readonly nodesGroup: SVGGElement;
  private nodes: Node[] = [];
  private _editableElement: PointedView | null = null;

  public constructor(container: TSVG) {
    super(container);
    this.nodesGroup = document.createElementNS(ElementView.svgURI, "g");
    this.nodesGroup.id = "nodes";
  }

  public makeMouseDown(position: Point, parameter: any) {
    this.nodes[parameter.order].makeMouseDown(position);
  }
  public makeMouseMove(position: Point, parameter: any) {
    this.nodes[parameter.order].makeMouseMove(position);
  }
  public makeMouseUp(position: Point, parameter: any) {
    this.nodes[parameter.order].makeMouseUp(position);
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
    this._container.focus(editableElement, false);
    this._editableElement = editableElement;
    let order = 0;
    for (let point of editableElement.points) {
      let node: Node = new Node(this._container, this, point, order++);
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

  protected _on(): void {
    this._isOn = true;
    for (let child of this._container.focused.children) {
      if (child instanceof PointedView) {
        this.editableElement = child;
        break;
      }
    }
    this._container.blur();
    if (this._editableElement)
      this._container.focus(this._editableElement, false);
    this._container.HTML.style.cursor = "default";

    this._container.call(Callback.EDIT_TOOl_ON);
  }

  public off(): void {
    this._isOn = false;
    this.removeEditableElement();
    this._container.blur();

    this._container.call(Callback.EDIT_TOOl_OFF);
  }
}
