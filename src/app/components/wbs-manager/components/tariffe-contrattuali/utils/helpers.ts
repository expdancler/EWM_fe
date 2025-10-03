export function numberWithPoints(x: string) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	// return parseFloat(x)
	// 	.toFixed(2)
	// 	.replace('.', ',')
	// 	.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function padTo2Digits(valore: any) {
	return valore.toString().padStart(2, '0');
}
export function formattaData(data: string) {
	const d = new Date(data);
	const mese = padTo2Digits(d.getMonth() + 1);
	const giorno = padTo2Digits(d.getDate());
	const anno = d.getFullYear();

	return [anno, mese, giorno].join('-');
}
