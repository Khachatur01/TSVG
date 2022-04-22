import {PathCursor, PathView} from "../../PathView";
import {Container} from "../../../../Container";
import {Path} from "../../../../model/path/Path";
import {ElementType} from "../../../../dataSource/constant/ElementType";
import {ElementCursor} from "../../../ElementView";
import {Cursor} from "../../../../dataSource/constant/Cursor";

export class FreeCursor extends PathCursor {
  constructor() {
    super();
    this.cursor[Cursor.EDIT] = "auto";
  }
}

export class FreeView extends PathView {
  protected override _type: ElementType = ElementType.FREE;

  constructor(container: Container, path: Path = new Path(), ownerId?: string, index?: number) {
    super(container, path, ownerId, index);
  }
  public override get copy(): FreeView {
    return super.copy as FreeView;
  }
}
