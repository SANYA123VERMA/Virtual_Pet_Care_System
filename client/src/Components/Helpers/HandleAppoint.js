import moment from "moment";

const HandleAppoint = (pets, called) => {
	let today = new Date(new Date().setHours(0, 0, 0, 0))
	let tomorrow = new Date();
	tomorrow.setDate(today.getDate() + 2);
	today.setDate(today.getDate() - 1);
	let med = [];
	let visit = [];
	let remind = [];

	//function to filter out all recent appointments
	if (pets && pets.length > 0) {
		pets.forEach((pet) => {
			// Medications
			if (pet.Medications && pet.Medications.length > 0) {
				pet.Medications.forEach((meq) => {
					if (moment(meq.DueDate).isBetween(today, tomorrow)) {
						med.push({
							Pet: pet.PetName,
							Date: meq.DueDate,
							Medication: meq.MedicationName,
							Dose: meq.Dose,
						});
					}
				});
			}

			// Vet Visits
			if (pet.VetVisits && pet.VetVisits.length > 0) {
				pet.VetVisits.forEach((viq) => {
					if (moment(viq.VisitDate).isBetween(today, tomorrow)) {
						visit.push({
							Pet: pet.PetName,
							Date: viq.VisitDate,
							Notes: viq.VisitNotes,
							Weight: viq.Weight,
						});
					}
				});
			}

			// Reminders
			if (pet.Reminders && pet.Reminders.length > 0) {
				pet.Reminders.forEach((req) => {
					if (moment(req.Date).isBetween(today, tomorrow)) {
						remind.push({
							Pet: pet.PetName,
							Date: req.Date,
							Title: req.Title,
							Notes: req.Note,
						});
					}
				});
			}
		});
	}

	if (called === "nav") return med.length + visit.length + remind.length;
	if (called === "notify") return [med, visit, remind];
};

export default HandleAppoint;
