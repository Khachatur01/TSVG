import {PathView} from "./PathView";
import {TSVG} from "../../../../TSVG";
import {Path} from "../../../../model/path/Path";
import {ElementType} from "../../../../dataSource/constant/ElementType";

export class FreeView extends PathView {
  constructor(container: TSVG, path: Path = new Path(), ownerId?: string, index?: number) {
    super(container, path, ownerId, index);
    this.type = ElementType.FREE;
  }
  public override get copy(): FreeView {
    return super.copy as FreeView;
  }
}
