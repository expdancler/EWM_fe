export default class Utils {
	// Formatta la data nel formato italiano.
	static formatDataIt(date: string | Date) {
		let dateToFormat = typeof date === 'string' ? new Date(date) : date;

		// Formatted --> GG/MM/YYYY
		return [
			String(dateToFormat.getDate()).padStart(2, '0'),
			String(dateToFormat.getMonth() + 1).padStart(2, '0'),
			dateToFormat.getFullYear(),
		].join('/');
	}

	static takeMonth(month: string) {
		switch (month) {
			case '01':
				return 'Gennaio';
			case '02':
				return 'Febbraio';
			case '03':
				return 'Marzo';
			case '04':
				return 'Aprile';
			case '05':
				return 'Maggio';
			case '06':
				return 'Giugno';
			case '07':
				return 'Luglio';
			case '08':
				return 'Agosto';
			case '09':
				return 'Settembre';
			case '10':
				return 'Ottobre';
			case '11':
				return 'Novembre';
			case '12':
				return 'Dicembre';
			default:
				return month;
		}
	}
}
