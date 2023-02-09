export class Style {
  protected style: Map<string, string> = new Map<string, string>();

  public get strokeWidth(): string {
    let width = this.style.get('stroke-width');
    if (!width) {
      width = '2';
    }
    return width;
  }
  public set strokeWidth(width: string) {
    this.style.set('stroke-width', width);
  }

  public get strokeColor(): string {
    let color = this.style.get('stroke');
    if (!color) {
      color = '#000000';
    }

    return color;
  }
  public set strokeColor(color: string) {
    this.style.set('stroke', color);
  }

  public get strokeDashArray(): string {
    let array = this.style.get('stroke-dasharray');
    if (!array) {
      array = '0';
    }

    return array;
  }
  public set strokeDashArray(array: string) {
    this.style.set('stroke-dasharray', array);
  }

  public get fillColor(): string {
    let color = this.style.get('fill');
    if(!color) {
      color = 'none';
    }

    return color;
  }
  public set fillColor(color: string) {
    this.style.set('fill', color);
  }

  public get fontSize(): string {
    let fontSize = this.style.get('font-size');
    if (!fontSize) {
      fontSize = '16';
    }

    return fontSize;
  }
  public set fontSize(size: string) {
    this.style.set('font-size', size);
  }

  public get fontColor(): string {
    let color = this.style.get('color');
    if (!color) {
      color = '#000000';
    }

    return color;
  }
  public set fontColor(color: string) {
    this.style.set('color', color);
  }

  public get backgroundColor(): string {
    let color = this.style.get('background-color');
    if (!color) {
      color = 'transparent';
    }

    return color;
  }
  public set backgroundColor(color: string) {
    this.style.set('background-color', color);
  }

  public set set(style: Style | any) {
    if (style.strokeWidth) {
      this.strokeWidth = style.strokeWidth;
    }
    if (style.strokeColor) {
      this.strokeColor = style.strokeColor;
    }
    if (style.fillColor) {
      this.fillColor = style.fillColor;
    }
    if (style.fontSizeMore) {
      this.fontSize = style.fontSizeMore;
    }
    if (style.fontColor) {
      this.fontColor = style.fontColor;
    }
    if (style.backgroundColor) {
      this.backgroundColor = style.backgroundColor;
    }
    if (style.strokeDashArray) {
      this.strokeDashArray = style.strokeDashArray;
    }
  }

  public clear(): void {
    this.style.clear();
  }

  public get object() {
    return {
      strokeWidth: this.strokeWidth,
      strokeColor: this.strokeColor,
      strokeDashArray: this.strokeDashArray,
      fillColor: this.fillColor,
      fontSizeMore: this.fontSize,
      fontColor: this.fontColor,
      backgroundColor: this.backgroundColor
    };
  }
  public toJSON(): any {
    return this.object;
  }
}
