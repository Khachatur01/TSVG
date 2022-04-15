import {ForeignObjectView} from "../ForeignObjectView";
import {Container} from "../../../Container";
import {Callback} from "../../../dataSource/constant/Callback";
import {ElementType} from "../../../dataSource/constant/ElementType";
import {Cursor} from "../../../dataSource/constant/Cursor";
import {ElementCursor} from "../../ElementView";
import {Rect} from "../../../model/Rect";

export class TextBoxCursor extends ElementCursor {
  constructor() {
    super();
    this.cursor[Cursor.EDIT] = "auto";
  }
}
export class TextBoxView extends ForeignObjectView {
  protected override _type: ElementType = ElementType.TEXT_BOX;

  public constructor(container: Container, rect: Rect = {x: 0, y: 0, width: 0, height: 0}, removeOnEmpty: boolean = true, ownerId?: string, index?: number) {
    super(container, rect, ownerId, index);

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
      if (this._container.editTool.isOn()) {
        this._container.call(Callback.TEXT_TYPING_COMMIT, {
          text: (this._content as HTMLTextAreaElement).value,
          element: this
        });
      }
    });
    this.style.setDefaultStyle();
  }

  public get text(): string {
    return (this._content as HTMLTextAreaElement).value;
  }
  public set text(text: string) {
    if(this._content) {
      (this._content as HTMLTextAreaElement).value = text;
    }
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
    return this._rect.width > 15 && this._rect.height > 15;
  }

  public override toJSON(): any {
    let json = super.toJSON();
    json["text"] = (this._content as HTMLTextAreaElement).value;
    json["content"] = undefined;
    return json;
  }
  public override fromJSON(json: any) {
    super.fromJSON(json);
    this.text = json.text;
  };
}
