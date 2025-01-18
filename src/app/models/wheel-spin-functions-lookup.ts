import { easeOutBack, easeInBounce, easeOutCirc, easeOutCubic, easeOutElastic, easeOutQuad, easeOutQuart, easeOutQuint, easeOutSine, linear } from "easing-utils";
import { EasingFunction } from "../types/wheel-types";

export const spinFunctions: {[key: string]: EasingFunction} = {
    ['Back']: easeOutBack,
    ['Bounce']: easeInBounce,
    ['Circular']: easeOutCirc,
    ['Cubic']: easeOutCubic,
    ['Elastic']: easeOutElastic,
    ['Quadratic']: easeOutQuad,
    ['Quartic']: easeOutQuart,
    ['Quintic']: easeOutQuint,
    ['Sine']: easeOutSine,
    ['Linear']: linear,
}