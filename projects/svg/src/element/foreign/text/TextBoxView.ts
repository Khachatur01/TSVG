import {ForeignObjectView} from "../ForeignObjectView";
import {TSVG} from "../../../TSVG";
import {Callback} from "../../../dataSource/constant/Callback";
import {Point} from "../../../model/Point";
import {Size} from "../../../model/Size";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {Cursor} from "../../../dataSource/constant/Cursor";
import {ElementCursor} from "../../ElementView";

export class TextBoxCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.EDIT] = "auto";
  }
}
export class TextBoxView extends ForeignObjectView {
  public constructor(container: TSVG, position: Point = {x: 0, y: 0}, size: Size = {width: 0, height: 0}, removeOnEmpty: boolean = true, ownerId?: string, index?: number) {
    super(container, position, size, ownerId, index);
    this.position = position;
    this.setSize({
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height
    });
    let textarea = document.createElement("textarea");
    textarea.style.width = "100%";
    textarea.style.height = "100%";
    textarea.style.resize = "none";
    textarea.style.border = "none";
    textarea.style.overflow = "hidden";
    textarea.spellcheck = false;
    this.setContent(textarea);

    if (removeOnEmpty) {
      this._container.addCallBack(Callback.EDIT_TOOl_OFF, () => {
        if (textarea.value == "")
          this._container.remove(this);
      });
    }

    textarea.addEventListener('blur', () => {
      if (textarea.value == "") {
        this._container.remove(this, true);
        this._container.selectTool.on();
      }
    });
    this.style.setDefaultStyle();
    this._type = ElementType.TEXT_BOX;
  }

  public get text(): string {
    return (this._content as HTMLTextAreaElement).value;
  }
  public set text(text: string) {
    if(this._content)
      (this._content as HTMLTextAreaElement).value = text;
  }

  public override addEditCallBack() {
    this._content?.addEventListener("input", () => {
      this._container.call(Callback.TEXT_TYPING,
        {text: (this._content as HTMLTextAreaElement).value, element: this}
      );
    });
  }

  public override get copy(): TextBoxView {
    return super.copy as TextBoxView;
  }

  public override isComplete(): boolean {
    let size = this.size;
    return size.width > 15 && size.height > 15;
  }
}
