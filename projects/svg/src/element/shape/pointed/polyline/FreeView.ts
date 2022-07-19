import {PathCursor, PathView} from "../../PathView";
import {Container} from "../../../../Container";
import {Path} from "../../../../model/path/Path";
import {ElementType} from "../../../../dataSource/constant/ElementType";
import {Cursor} from "../../../../dataSource/constant/Cursor";
import {ElementProperties} from "../../../ElementView";

export class FreeCursor extends PathCursor {
  constructor() {
    super();
    this.cursor[Cursor.EDIT_NODE] = "auto";
  }
}

export class FreeView extends PathView {
  protected override _type: ElementType = ElementType.FREE;

  constructor(container: Container, properties: ElementProperties = {}, path: Path = new Path(), ownerId?: string, index?: number) {
    super(container, {}, path, ownerId, index);
    this.setProperties(properties);
  }
  public override get copy(): FreeView {
    let copy: FreeView = Object.assign(
      new FreeView(this._container, this._properties),
      super.copy
    );
    copy._type = ElementType.FREE;
    return copy;
  }
}
