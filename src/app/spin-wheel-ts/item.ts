import * as util from './util.js';
import { Defaults } from './constants.js';
import { Wheel } from './wheel.js';

type Props = {
  backgroundColor: string | null;
  image: HTMLImageElement | null;
  imageOpacity: number;
  imageRadius: number;
  imageRotation: number;
  imageScale: number;
  label: string;
  labelColor: string | null;
  value: string | null;
  weight: number;
};

export class Item {
  private _wheel: Wheel;
  private _backgroundColor: string | null = Defaults.item.backgroundColor;
  private _image: HTMLImageElement | null = Defaults.item.image;
  private _imageOpacity: number = Defaults.item.imageOpacity;
  private _imageRadius: number = Defaults.item.imageRadius;
  private _imageRotation: number = Defaults.item.imageRotation;
  private _imageScale: number = Defaults.item.imageScale;
  private _label: string = Defaults.item.label;
  private _labelColor: string | null = Defaults.item.labelColor;
  private _value: string | null = Defaults.item.value;
  private _weight: number = Defaults.item.weight;
  public path: Path2D | undefined;

  constructor(wheel: Wheel, props: Partial<Props>) {
    // Validate params.
    if (!util.isObject(wheel)) {
      throw new Error('wheel must be an instance of Wheel'); // Ideally we would use instanceof, however importing the Wheel class would create a circular ref.
    }
    if (!util.isObject(props) && props !== null) {
      throw new Error('props must be an Object or null');
    }

    this._wheel = wheel;

    if (props) {
      this.init(props);
    } else {
      this.init(Defaults.item);
    }
  }

  /**
   * Initialise all properties.
   */
  init(props: Partial<Props>) {
    this.backgroundColor = props.backgroundColor;
    this.image = props.image;
    this.imageOpacity = props.imageOpacity;
    this.imageRadius = props.imageRadius;
    this.imageRotation = props.imageRotation;
    this.imageScale = props.imageScale;
    this.label = props.label;
    this.labelColor = props.labelColor;
    this.value = props.value;
    this.weight = props.weight;
  }

  /**
   * The background color of the item.
   * When `null`, the actual color rendered will fall back to `Wheel.itemBackgroundColors`.
   * Example: `'#fff'`.
   */
  get backgroundColor(): string | null {
    return this._backgroundColor;
  }
  set backgroundColor(val: string | null | undefined) {
    if (typeof val === 'string') {
      this._backgroundColor = val;
    } else {
      this._backgroundColor = Defaults.item.backgroundColor;
    }
    this._wheel.refresh();
  }

  /**
   * The url of an image that will be drawn on the item.
   * Any part of the image that extends outside the item will be clipped.
   * The image will be drawn over the top of `Item.backgroundColor`.
   */
  get image(): HTMLImageElement | null {
    return this._image;
  }
  set image(val: string | HTMLImageElement | null | undefined) {
    let img;
    if (typeof val === 'string') {
      img = new Image();
      img.src = val;
      img.onload = (e) => this._wheel.refresh();
    } else if (val === null || val === undefined) {
      img = Defaults.item.image;
    }
    else {
      img = val;
    }
    this._image = img;
    this._wheel.refresh();
  }

  /**
   * The opacity (as a percent) of `Item.image`.
   * Useful if you want to fade the image to make the item's label stand out.
   */
  get imageOpacity(): number {
    return this._imageOpacity;
  }
  set imageOpacity(val: number | undefined) {
    if (typeof val === 'number') {
      this._imageOpacity = val;
    } else {
      this._imageOpacity = Defaults.item.imageOpacity;
    }
    this._wheel.refresh();
  }

  /**
   * The point along the radius (as a percent, starting from the center of the wheel) to draw the center of `Item.image`.
   */
  get imageRadius(): number {
    return this._imageRadius;
  }
  set imageRadius(val: number | undefined) {
    if (typeof val === 'number') {
      this._imageRadius = val;
    } else {
      this._imageRadius = Defaults.item.imageRadius;
    }
    this._wheel.refresh();
  }

  /**
   * The rotation (angle in degrees) of `Item.image`.
   */
  get imageRotation(): number {
    return this._imageRotation;
  }
  set imageRotation(val: number | undefined) {
    if (typeof val === 'number') {
      this._imageRotation = val;
    } else {
      this._imageRotation = Defaults.item.imageRotation;
    }
    this._wheel.refresh();
  }

  /**
   * The scale (as a percent) to resize `Item.image`.
   */
  get imageScale(): number {
    return this._imageScale;
  }
  set imageScale(val: number | undefined) {
    if (typeof val === 'number') {
      this._imageScale = val;
    } else {
      this._imageScale = Defaults.item.imageScale;
    }
    this._wheel.refresh();
  }

  /**
   * The text that will be drawn on the item.
   */
  get label(): string {
    return this._label;
  }
  set label(val: string | undefined) {
    if (typeof val === 'string') {
      this._label = val;
    } else {
      this._label = Defaults.item.label;
    }
    this._wheel.refresh();
  }

  /**
   * The color of the label.
   * When `null`, the actual color rendered will fall back to `Wheel.itemLabelColors`.
   * Example: `'#000'`.
   */
  get labelColor(): string | null {
    return this._labelColor;
  }
  set labelColor(val: string | null | undefined) {
    if (typeof val === 'string') {
      this._labelColor = val;
    } else {
      this._labelColor = Defaults.item.labelColor;
    }
    this._wheel.refresh();
  }

  /**
   * Some value that has meaning to your application.
   * For example, a reference to the object representing the item on the wheel, or a database id.
   */
  get value(): string | null {
    return this._value;
  }
  set value(val: string | null | undefined) {
    if (!!val) {
      this._value = val;
    } else {
      this._value = Defaults.item.value;
    }
  }

  /**
   * The proportional size of the item relative to other items on the wheel.
   * For example, if you have 2 items where `item[0]` has a weight of `1` and `item[1]` has a weight of `2`,
   * then `item[0]` will take up 1/3 of the space on the wheel.
   */
  get weight(): number {
    return this._weight;
  }
  set weight(val: number | undefined) {
    if (typeof val === 'number') {
      this._weight = val;
    } else {
      this._weight = Defaults.item.weight;
    }
  }

  /**
   * Get the 0-based index of this item.
   */
  getIndex() {
    const index = this._wheel.items.findIndex((i) => i === this);
    if (index === -1) throw new Error('Item not found in parent Wheel');
    return index;
  }

  /**
   * Get the angle (in degrees) that this item ends at (exclusive), ignoring the current `rotation` of the wheel.
   */
  getCenterAngle() {
    const angle = this._wheel.getItemAngles()[this.getIndex()];
    if (!angle) {
      throw new Error('Item not found in parent Wheel');
    }
    return angle.start + (angle.end - angle.start) / 2;
  }

  /**
   * Get the angle (in degrees) that this item starts at (inclusive), ignoring the current `rotation` of the wheel.
   */
  getStartAngle() {
    const angle = this._wheel.getItemAngles()[this.getIndex()];
    if (!angle) {
      throw new Error('Item not found in parent Wheel');
    }
    return angle.start;
  }

  /**
   * Get the angle (in degrees) that this item ends at (inclusive), ignoring the current `rotation` of the wheel.
   */
  getEndAngle() {
    const angle = this._wheel.getItemAngles()[this.getIndex()];
    if (!angle) {
      throw new Error('Item not found in parent Wheel');
    }
    return angle.end;
  }

  /**
   * Return a random angle (in degrees) between this item's start angle (inclusive) and end angle (inclusive).
   */
  getRandomAngle() {
    return util.getRandomFloat(this.getStartAngle(), this.getEndAngle());
  }
}
