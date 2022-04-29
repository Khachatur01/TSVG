import {Tool} from "../Tool";
import {Container} from "../../../Container";
import {PointedView} from "../../../element/shape/pointed/PointedView";
import {ElementView} from "../../../element/ElementView";
import {Point} from "../../../model/Point";
import {Node} from "./Node";
import {Event} from "../../../dataSource/constant/Event";
import {Focus} from "../../edit/group/Focus";
import {Cursor} from "../../../dataSource/constant/Cursor";
import {ForeignObjectView} from "../../../element/foreign/ForeignObjectView";
import {FreeView} from "../../../element/shape/pointed/polyline/FreeView";

export class EditTool extends Tool {
  private readonly nodesGroup: SVGGElement;
  private nodes: Node[] = [];
  private _editableElement: ElementView | null = null;
  public focus: Focus;

  public constructor(container: Container, focus: Focus) {
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

  private set refPoint(refPoint: Point) {
    this.nodesGroup.style.transformOrigin = refPoint.x + "px " + refPoint.y + "px";
  }
  private rotate(angle: number) {
    this.nodesGroup.style.transform = "rotate(" + angle + "deg)";
  }

  public get SVG(): SVGGElement {
    return this.nodesGroup;
  }

  public get nodeEditableElement(): PointedView | null {
    if (this._editableElement instanceof PointedView) {
      return this._editableElement;
    }
    return null;
  }
  public get editableElement(): ElementView | null {
    return this._editableElement;
  }
  public set editableElement(editableElement: ElementView | null) {
    if (!editableElement) return;
    this.removeEditableElement();
    if (!(
        editableElement instanceof PointedView ||
        editableElement instanceof ForeignObjectView)
    ) {
      return;
    }

    this.focus.appendChild(editableElement, false, false);
    this._editableElement = editableElement;
    this._editableElement.__onFocus__();

    if (editableElement instanceof PointedView) {
      let order = 0;
      let points = editableElement.points;
      for (let point of points) {
        let node: Node = new Node(this._container, this, point, order++);
        node.__on__();
        this.nodes.push(node);
        this.nodesGroup.appendChild(node.SVG);
      }

      this.refPoint = editableElement.__refPoint__;
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

  public override on(changeActiveTool: boolean = true, call: boolean = true): void {
    super.on(changeActiveTool);
    this._isOn = true;
    let [firstChild] = this.focus.children;
    this.editableElement = firstChild;
    this._container.blur();
    if (this._editableElement)
      this._container.focus(this._editableElement, false);

    this._container.style.changeCursor(Cursor.EDIT);
    if (call) {
      this._container.__call__(Event.EDIT_TOOl_ON);
    }
  }
  public override off(call: boolean = true): void {
    super.off();
    this._isOn = false;
    this.focus.clear();
    this.removeEditableElement();

    if (call) {
      this._container.__call__(Event.EDIT_TOOl_OFF);
    }
  }
}
