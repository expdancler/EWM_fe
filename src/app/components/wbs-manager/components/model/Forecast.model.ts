import { TCostElement } from "./TCostElement.model";

interface TCeEmpl {
	Fyear: string;
	Description: string;
	DailyCost: string;
	Value: string;
	Quantity: string;
	ParentIdRow: string;
	IdRow: string;
	CostProfile: string;
	Fmonth: string;
}

interface TCeCons {
	Fyear: string;
	Fmonth: string;
	ParentIdRow: string;
	IdRow: string;
	Supplier: string;
	DescSupplier: string;
	Description: string;
	DailyCost: string;
	Quantity: string;
	Value: string;
}

export interface Forecast {
	StartDate: string;
	EndDate: string;
	TCostElement?: TCostElement[];
	TCeEmpl?: TCeEmpl[];
	TCeCons?: TCeCons[];
}
