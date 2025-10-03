interface Prof {
	ProfileId: string;
	Profile: string;
	Description: string;
}

interface Rate {
	ProfileId: string;
	RateId: string;
	StartDate: string;
	EndDate: string;
	Rate: string;
}

interface Empl {
	Persno: string;
	Name: string;
	ProfileId: string;
}

export interface ProfCtr {
	TProf: Prof[];
	TRate: Rate[];
	TEmpl: Empl[];
}
