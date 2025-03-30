import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Item } from "../spin-wheel-ts/item";

@Injectable({
    providedIn: 'root'
})
export class WheelService {
    private wheelItems = new BehaviorSubject<Partial<Item>[]>([]);
    public readonly wheelItems$ = this.wheelItems.asObservable();

    private wheelIsSpinning = new BehaviorSubject<boolean>(false);
    public readonly wheelIsSpinning$ = this.wheelIsSpinning.asObservable();

    updateItems(items: Partial<Item>[]) {
        this.wheelItems.next(items);
    }

    updateIsSpinning(isSpinning: boolean) {
        this.wheelIsSpinning.next(isSpinning);
    }
}