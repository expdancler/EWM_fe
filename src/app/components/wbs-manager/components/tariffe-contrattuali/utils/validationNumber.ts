export function truncateStringNumberDecimal(val: any, splitSymbol: string) {
	const split = val.split(splitSymbol);

	if (split[1]) {
		const decimalTruncate = split[1].substring(0, 2);
		return split[0] + splitSymbol + decimalTruncate;
	}

	return split[0];
}

export function checkInputNumber(valore: any) {
	valore.target.value = valore.target.value.trim();
	let regexp = /^-?\d{1,3}(\.\d{3})*(,\d+)?$|^\d+$|^\d+(,\d+)?$/;
	let errore = !regexp.test(valore.target.value);
	if (valore.target.value.trim() === '') {
		errore = false;
	}
	return errore;
}
