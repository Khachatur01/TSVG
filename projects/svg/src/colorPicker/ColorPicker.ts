import Picker from "vanilla-picker";

namespace ColorPicker {
  export interface Color {
    hex: string,
    title: string
  }
}
export class ColorPicker {
  private readonly parent: HTMLElement;
  private readonly menu: HTMLDivElement;
  private readonly palette: HTMLDivElement;
  private colors: ColorPicker.Color[] = [
    {hex: "#000", title: "black"},
    {hex: "#FFF", title: "white"},
    {hex: "#F00", title: "red"},
    {hex: "#0F0", title: "green"},
    {hex: "#00F", title: "blue"}
  ];
  private advancedPicker: Picker;
  private onChangeCallBack: Function | null = null;
  private static styleFileAdded = false;

  public constructor(parent: HTMLElement) {
    if (!ColorPicker.styleFileAdded) {
      document.head.innerHTML +=
        '<style>' +
        '.colorPickerParent {\n' +
        '  background:\n' +
        '    linear-gradient(45deg, lightgrey 25%, transparent 25%, transparent 75%, lightgrey 75%) 0 0/2em 2em,\n' +
        '    linear-gradient(45deg, lightgrey 25%, white 25%, white 75%, lightgrey 75%) 1em 1em/2em 2em;\n' +
        '}\n' +
        '.colorPickerParent::before {\n' +
        '  content: "";\n' +
        '  position: absolute;\n' +
        '  left: 0;\n' +
        '  top: 0;\n' +
        '  display: block;\n' +
        '  width: 100%;\n' +
        '  height: 100%;' +
        '  background: currentColor;\n' +
        '}\n' +
        '</style>';
      ColorPicker.styleFileAdded = true;
    }

    parent.classList.add("colorPickerParent");

    this.parent = parent;
    this.palette = this.createPalette();
    this.fillPalette();

    this.menu = document.createElement("div");
    this.menu.style.position = "absolute";
    this.menu.style.maxWidth = "220px";
    this.menu.style.top = "100%";
    this.menu.style.left = "100%";
    this.menu.style.border = "1px #cecece solid";
    this.menu.style.borderRadius = "5px";
    this.menu.style.zIndex = "2";
    this.menu.style.backgroundColor = "#FFFFFF";
    this.menu.style.padding = "5px";

    /* advanced picker button */
    let advanced = document.createElement("button");
    advanced.textContent = "More";
    advanced.title = "Advanced";
    advanced.style.border = "none";
    advanced.style.minWidth = "30px";
    advanced.style.minHeight = "30px";
    advanced.style.margin = "5px 5px 0 0";
    advanced.style.outline = "1px #cecece solid";
    advanced.style.borderRadius = "5px";
    advanced.addEventListener("click", () => {
      this.openAdvancedPicker();
    });
    this.advancedPicker = new Picker(advanced);
    this.advancedPicker.onChange = (color) => {
      this.changeCallBack(color.hex);
    };
    /* advanced picker button */

    this.parent.appendChild(this.menu);
    this.parent.addEventListener("click", (e) => {
      if (e.target == this.parent)
        this.openPalette();
    });

    this.menu.appendChild(this.palette);
    this.menu.appendChild(advanced);
    this.closePalette();
  }

  private createPalette(): HTMLDivElement {
    let palette = document.createElement("div");
    palette.style.display = "grid";
    palette.style.gridTemplateColumns = "auto auto auto auto";
    palette.style.gridColumn = "1";
    palette.style.gridGap = "5px";
    window.addEventListener('click', (e) => {
      if (!this.parent.contains(e.target as Node)) {
        this.closePalette();
      }
    });
    return palette;
  }
  private fillPalette(): void {
    this.palette.innerHTML = "";
    this.colors.forEach((color: ColorPicker.Color) => {
      let colorPad = document.createElement("div");
      colorPad.style.width = "30px";
      colorPad.style.height = "30px";
      colorPad.style.outline = "1px #cecece solid";
      colorPad.style.borderRadius = "5px";
      colorPad.style.backgroundColor = color.hex;
      colorPad.title = color.title;
      colorPad.addEventListener("click", () => {
        this.advancedPicker.setColor(color.hex, true);
        this.changeCallBack(color.hex);
      });
      this.palette.appendChild(colorPad);
    });
  }

  public changeCallBack(color: string) {
    this.parent.style.color = color;
    if (this.onChangeCallBack)
      this.onChangeCallBack(color);
  }

  public set paletteColors(colors: ColorPicker.Color[]) {
    this.colors = colors;
    this.fillPalette();
  }
  public addPaletteColor(color: ColorPicker.Color) {
    this.colors.push(color);
  }
  public removePaletteColor(color: ColorPicker.Color) {
    this.colors.splice(this.colors.indexOf(color), 1);
  }
  public set color(color: string) {
    if (color == "none" || color == "transparent")
      color = "#FFFFFF00";
    this.advancedPicker.setColor(color, true);
  }
  public set onChange(callback: Function) {
    this.onChangeCallBack = callback;
  }

  public openPalette(): void {
    this.menu.style.display = "block";
  }
  public closePalette(): void {
    this.closeAdvancedPicker();
    this.menu.style.display = "none";
  }
  public openAdvancedPicker(): void {
    this.openPalette();
    this.advancedPicker.show();
  }
  public closeAdvancedPicker(): void {
    this.advancedPicker.hide();
  }
}
