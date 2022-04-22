import {ElementView} from "../ElementView";

export abstract class ForeignView extends ElementView {
  override __onFocus__() {}
  override __onBlur__() {}
}
