import { Directive, ElementRef, Input, HostListener, forwardRef,  Renderer2  } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MAT_INPUT_VALUE_ACCESSOR } from '@angular/material/input';
import { numberWithPoints } from '../utils/helpers';

@Directive({
	selector: 'input[matInputCommified]',
	providers: [
		{ provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: MatInputCommifiedDirective },
		{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MatInputCommifiedDirective), multi: true },
	],
})
export class MatInputCommifiedDirective {
	private _value: string | null = '';

	constructor(private elementRef: ElementRef<HTMLInputElement>, private render: Renderer2 ) {}

	get value(): string | null {
		return this._value;
	}

	@Input('value')
	set value(value: string | null) {
		this._value = value;
		this.formatValue(value);
	}

	private formatValue(value: string | null) {
		if (value !== null) {
			this.elementRef.nativeElement.value = numberWithPoints(value);
		} else {
			this.elementRef.nativeElement.value = '';
		}
	}

	private unFormatValue() {
		const value = this.elementRef.nativeElement.value;
		this._value = value.replace(/[^\d,-]/g, '');
		// this._value = value.replace(/[^\d.-]/g, '');
		if (value) {
			this.elementRef.nativeElement.value = this._value;
		} else {
			this.elementRef.nativeElement.value = '';
		}
	}

	// Is same of write (input)="$event.target.value"
	@HostListener('input', ['$event.target.value'])
	onInput(value: string) {
		// here we cut any non numerical symbols
		this._value = value.replace(/[^\d,-]/g, '');
		this._onChange(this._value); // here to notify Angular Validators
	}

	// format text when click out of the field
	@HostListener('blur')
	_onBlur() {
		this.formatValue(this._value); // add points
	}

	// when click into field, performs the unformat
	@HostListener('focus')
	onFocus() {
		this.unFormatValue(); // remove points for editing purpose
	}

	// we should run the registered _onChange handler every time the value is changed
	_onChange(value: any): void {}

	// it should apply formatting on value assignment
	writeValue(value: any) {
		this._value = value;
		this.formatValue(this._value);
	}

	registerOnChange(fn: (value: any) => void) {
		this._onChange = fn;
	}

	registerOnTouched() {}

	setDisabledState(isDisabled: boolean): void {
		this.render.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled)
	}
}
