import {ComplexView} from "../type/ComplexView";
import {ElementType} from "../../dataSource/constant/ElementType";
import {Point} from "../../model/Point";
import {Rect} from "../../model/Rect";
import {ElementCursor, ElementView} from "../ElementView";
import {PathView} from "../shape/PathView";
import {Container} from "../../Container";
import {ElementProperties} from "../../model/ElementProperties";
import {MoveDrawable} from "../../service/tool/draw/type/MoveDrawable";
import {LineView} from "../shape/pointed/LineView";

interface TableRow {
  height: number,
  line?: LineView,
}

interface TableCol {
  width: number,
  line?: LineView,
}

export class TableCursor extends ElementCursor {}

export class TableView extends ComplexView implements MoveDrawable {
  protected svgElement: SVGElement = document.createElementNS(ElementView.svgURI, "g");
  protected _type: ElementType = ElementType.TABLE;

  private _rows: TableRow[] = [];
  private _cols: TableCol[] = [];

  private lastRows: TableRow[] = [];
  private lastCols: TableCol[] = [];

  private topBorderLine: LineView;
  private leftBorderLine: LineView;

  public constructor(container: Container,
                     properties: ElementProperties = {},
                     rect = {x: 0, y: 0, width: 1, height: 1},
                     cols: number = 0, rows: number = 0,
                     ownerId?: string, index?: number) {

    super(container, {}, ownerId, index);
    this.svgElement.id = this.id;
    this.topBorderLine = new LineView(this._container, {overEvent: false, globalStyle: false},
      {x: rect.x, y: rect.y}, {x: rect.x + rect.width, y: rect.y});
    this.leftBorderLine = new LineView(this._container, {overEvent: false, globalStyle: false},
      {x: rect.x, y: rect.y}, {x: rect.x, y: rect.y + rect.height});

    this.recreate(rect, rows, cols);

    this.svgElement.appendChild(this.topBorderLine.SVG);
    this.svgElement.appendChild(this.leftBorderLine.SVG);

    this.__fixRect__();

    this.setProperties(properties);
  }

  public __correct__(refPoint: Point, lastRefPoint: Point): void {
    let delta = this.__getCorrectionDelta__(refPoint, lastRefPoint);
    if (delta.x == 0 && delta.y == 0) return;

    this._rect.x += delta.x;
    this._rect.y += delta.y;

    this.__updateView__();
  }

  public __drag__(delta: Point): void {
    this._rect.x += delta.x;
    this._rect.y += delta.y;
    this.topBorderLine.__drag__(delta);
    this.leftBorderLine.__drag__(delta);
    this._rows.forEach(row => {
      row.line?.__drag__(delta);
    });
    this._cols.forEach(col => {
      col.line?.__drag__(delta);
    });
  }

  public getRowsHeight(from: number = 0, to: number = this._rows.length): number {
    let height = 0;
    while (from <= to) {
      height += this._rows[from].height;
      from++;
    }
    return height;
  }

  public getColsWidth(from: number = 0, to: number = this._cols.length): number {
    let width = 0;
    while (from <= to) {
      width += this._cols[from].width;
      from++;
    }
    return width;
  }

  public get rows(): TableRow[] {
    return this._rows;
  }
  public get cols(): TableCol[] {
    return this._cols;
  }
  public addRow(height: number): void {
    this._rect.height += height;
    this._rows.push({height: height});
    this.__rerenderView__();
  }
  public addCol(width: number): void {
    this._rect.width += width;
    this._cols.push({width: width});
    this.__rerenderView__();
  }
  public modifyRow(index: number, height: number) {
    let oldHeight = this._rows[index].height;
    let deltaHeight = height - oldHeight;

    let previousRowY = index == 0 ? this._rect.y : this._rows[index - 1].line?.getPoint(0).y;
    let thisRowY = this._rows[index].line?.getPoint(0).y;
    let nextRowY = index == this._rows.length - 1 ? this._rect.y + this._rect.height : this._rows[index + 1].line?.getPoint(0).y;

    if (!(previousRowY && thisRowY && nextRowY)) {
      return;
    }

    if (previousRowY + 5 < thisRowY + deltaHeight && (index == this._rows.length - 1 || thisRowY + deltaHeight < nextRowY - 5)) {
      this._rows[index].height = height;
      if (index == this._rows.length - 1) {
        this._rect.height += deltaHeight;
      } else {
        this._rows[index + 1].height -= deltaHeight;
      }
    }

    this.__updateView__();
  }
  public modifyCol(index: number, width: number) {
    let oldWidth = this._cols[index].width;
    let deltaWidth = width - oldWidth;

    let previousRowX = index == 0 ? this._rect.x : this._cols[index - 1].line?.getPoint(0).x;
    let thisRowX = this._cols[index].line?.getPoint(0).x;
    let nextRowX = index == this._cols.length - 1 ? this._rect.x + this._rect.width : this._cols[index + 1].line?.getPoint(0).x;

    if (!(previousRowX && thisRowX && nextRowX)) {
      return;
    }

    if (previousRowX + 5 < thisRowX + deltaWidth && (index == this._cols.length - 1 || thisRowX + deltaWidth < nextRowX - 5)) {
      this._cols[index].width = width;
      if (index == this._cols.length - 1) {
        this._rect.width += deltaWidth;
      } else {
        this._cols[index + 1].width -= deltaWidth;
      }
    }

    this.__updateView__();
  }

  public recreate(rect: Rect, rows: number, cols: number): void {
    this._rows = [];
    this._cols = [];

    this._rect = rect;

    if (rows > 0) {
      let height = rect.height / rows;
      for (let i = 0; i < rows; i++) {
        this._rows.push({
          height: height
        });
      }
    }
    if (cols > 0) {
      let width = rect.width / cols;
      for (let i = 0; i < cols; i++) {
        this._cols.push({
          width: width
        });
      }
    }
    this.__rerenderView__();
  }

  public setTable(rect: Rect, rows: TableRow[], cols: TableCol[]): void {
    this._rows = rows;
    this._cols = cols;
    this._rect = rect;
    this.__rerenderView__();
  }

  public __drawSize__(rect: Rect): void {
    this.recreate(rect, this._rows.length, this._cols.length);
  }
  public __setRect__(rect: Rect, delta?: Point): void {
    let dw = 1;
    let dh = 1;

    if (delta) {
      dw = delta.x;
      dh = delta.y;
    } else {
      if (this._lastRect.width != 0)
        dw = rect.width / (/*this._lastRect.x - rect.x + */this._lastRect.width);
      if (this._lastRect.height != 0)
        dh = rect.height / (/*this._lastRect.y - rect.y + */this._lastRect.height);
    }

    this._rect = rect;

    for (let i = 0; i < this.lastRows.length; i++) {
      this._rows[i].height = this.lastRows[i].height * dh;
    }
    for (let i = 0; i < this.lastCols.length; i++) {
      this._cols[i].width = this.lastCols[i].width * dw;
    }

    this.__updateView__();
  }

  /** remove old table and draw new */
  public __rerenderView__(): void {
    this.svgElement.innerHTML = "";
    this.svgElement.appendChild(this.topBorderLine.SVG);
    this.svgElement.appendChild(this.leftBorderLine.SVG);

    this.topBorderLine.replacePoint(0, {x: this._rect.x, y: this._rect.y});
    this.topBorderLine.replacePoint(1, {x: this._rect.x + this._rect.width, y: this._rect.y});
    this.leftBorderLine.replacePoint(0, {x: this._rect.x, y: this._rect.y});
    this.leftBorderLine.replacePoint(1, {x: this._rect.x, y: this._rect.y + this._rect.height});

    let currentHeight = 0;
    for (let i = 0; i < this._rows.length; i++) {
      currentHeight += this._rows[i].height;
      let line = new LineView(this._container,
        {overEvent: false, globalStyle: false},
        {x: this._rect.x, y: currentHeight + this._rect.y},
        {x: this._rect.x + this._rect.width, y: currentHeight + this._rect.y});
      this._rows[i].line = line;
      this.svgElement.appendChild(line.SVG);
    }

    let currentWidth = 0;
    for (let i = 0; i < this._cols.length; i++) {
      currentWidth += this._cols[i].width;
      let line = new LineView(this._container,
        {overEvent: false, globalStyle: false},
        {x: currentWidth + this._rect.x, y: this._rect.y},
        {x: currentWidth + this._rect.x, y: this._rect.y + this._rect.height});
      this._cols[i].line = line;
      this.svgElement.appendChild(line.SVG);
    }
  }
  /** modify table lineViews only */
  public __updateView__(): void {
    this.topBorderLine.replacePoint(0, {x: this._rect.x, y: this._rect.y});
    this.topBorderLine.replacePoint(1, {x: this._rect.x + this._rect.width, y: this._rect.y});
    this.leftBorderLine.replacePoint(0, {x: this._rect.x, y: this._rect.y});
    this.leftBorderLine.replacePoint(1, {x: this._rect.x, y: this._rect.y + this._rect.height});

    let currentHeight = 0;
    for (let i = 0; i < this._rows.length; i++) {
      currentHeight += this._rows[i].height;
      this._rows[i].line?.replacePoint(0, {x: this._rect.x, y: currentHeight + this._rect.y});
      this._rows[i].line?.replacePoint(1, {x: this._rect.x + this._rect.width, y: currentHeight + this._rect.y});
      // let line = new LineView(this._container,
      //   {overEvent: false, globalStyle: false},
      //   {x: this._rect.x, y: currentHeight + this._rect.y},
      //   {x: this._rect.x + this._rect.width, y: currentHeight + this._rect.y});
      // this._rows[i].line = line;
      // this.svgElement.appendChild(line.SVG);
    }

    let currentWidth = 0;
    for (let i = 0; i < this._cols.length; i++) {
      currentWidth += this._cols[i].width;
      this._cols[i].line?.replacePoint(0, {x: currentWidth + this._rect.x, y: this._rect.y});
      this._cols[i].line?.replacePoint(1, {x: currentWidth + this._rect.x, y: this._rect.y + this._rect.height});
      // let line = new LineView(this._container,
      //   {overEvent: false, globalStyle: false},
      //   {x: currentWidth + this._rect.x, y: this._rect.y},
      //   {x: currentWidth + this._rect.x, y: this._rect.y + this._rect.height});
      // this._cols[i].line = line;
      // this.svgElement.appendChild(line.SVG);
    }
  }

  public override __fixRect__(): void {
    super.__fixRect__();
    this.topBorderLine.__fixRect__();
    this.leftBorderLine.__fixRect__();

    this.lastRows = [];
    for (let i = 0; i < this._rows.length; i++) {
      this.lastRows.push({height: this._rows[i].height});
      this._rows[i].line?.__fixRect__();
    }
    this.lastCols = [];
    for (let i = 0; i < this._cols.length; i++) {
      this.lastCols.push({width: this._cols[i].width});
      this._cols[i].line?.__fixRect__();
    }
  }

  public get copyRows(): TableRow[] {
    let rowsCopy: TableRow[] = [];
    this._rows.forEach(row => {
      rowsCopy.push({height: row.height});
    });
    return rowsCopy;
  }
  public get copyCols(): TableCol[] {
    let colsCopy: TableCol[] = [];
    this._cols.forEach(col => {
      colsCopy.push({width: col.width});
    });
    return colsCopy;
  }

  public get copy(): ElementView {
    let table: TableView = new TableView(this._container, this._properties);

    table.setTable(
      Object.assign({}, this._rect),
      this.copyRows,
      this.copyCols
    );

    table.__fixRect__();

    table.refPoint = Object.assign({}, this._refPoint);
    table.__rotate__(this._angle);

    table.style.set = this.style;
    return table;
  }

  public isComplete(): boolean {
    return this._rect.width > 0 && this._rect.height > 0 && this._rows.length > 0 && this._cols.length > 0;
  }

  public toPath(): PathView {
    /* todo */
    return new PathView(this._container);
  }

  public override toJSON(): any {
    let json = super.toJSON();
    json["rows"] = this.copyRows;
    json["_cols"] = this.copyCols;
    return json;
  }
  public override fromJSON(json: any): void {
    super.fromJSON(json);
    this._rows = json["rows"];
    this._cols = json["_cols"];
    this.__rerenderView__();
  };
}
