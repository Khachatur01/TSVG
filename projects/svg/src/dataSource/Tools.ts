import {Container} from "../Container";
import {Tool} from "../service/tool/Tool";
import {DrawTool} from "../service/tool/draw/DrawTool";
import {HighlightTool} from "../service/tool/highlighter/HighlightTool";
import {PointerTool} from "../service/tool/pointer/PointerTool";
import {SelectTool} from "../service/tool/select/SelectTool";
import {EditNodeTool} from "../service/tool/edit/node/EditNodeTool";
import {EditTableTool} from "../service/tool/edit/table/EditTableTool";

export class Tools {
  private readonly _container: Container;
  public drawTool: DrawTool;
  public highlightTool: HighlightTool;
  public pointerTool: PointerTool;
  public selectTool: SelectTool;
  public editNodeTool: EditNodeTool;
  public editTableTool: EditTableTool;
  public activeTool: Tool | null;

  public constructor(container: Container) {
    this._container = container;

    this.drawTool = new DrawTool(this._container);
    this.highlightTool = new HighlightTool(this._container);
    this.pointerTool = new PointerTool(this._container);
    this.selectTool = new SelectTool(this._container, this._container.focused);
    this.editNodeTool = new EditNodeTool(this._container, this._container.focused);
    this.editTableTool = new EditTableTool(this._container, this._container.focused);
    this.activeTool = this.selectTool;
  }
}
