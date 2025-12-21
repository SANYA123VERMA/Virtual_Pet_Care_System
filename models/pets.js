const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
	PetName: {
		type: String,
		required: true,
	},
	BirthDate: {
		type: Date,
	},
	PetImageLoc: {
		type: String,
	},
	Gender: {
		type: String,
	},
	TypeOfPet: {
		type: String,
		required: true,
	},
	Breed: {
		type: String,
	},
	VetVisits: [
		{
			VisitDate: {
				type: Date,
			},
			VisitNotes: {
				type: String,
			},
			Weight: {
				type: Number,
			}
		},
	],
	Medications: [
		{
			MedicationName: {
				type: String,
			},
			DueDate: {
				type: Date,
				default: Date.now
			},
			Dose: {
				type: String,
			},
			Time: {
				type: String,
			},
		},
	],
	Vaccinations: [
		{
			Name: {
				type: String,
				required: true,
			},
			DateAdministered: {
				type: Date,
			},
			NextDueDate: {
				type: Date,
			},
		},
	],
	Reminders: [
		{
			Date: {
				type: Date,
			},
			Title: {
				type: String,
			},
			Note: {
				type: String,
			},
			Frequency: {
				type: String,
				default: "Once",
			},
			SelectedDays: {
				type: [String],
				default: [],
			}
		},
	],
	Activities: [
		{
			ActivityType: {
				type: String,
				required: true,
			},
			Duration: {
				type: Number,
				required: true,
			},
			Date: {
				type: Date,
				default: Date.now,
			},
			Notes: {
				type: String,
			}
		}
	],
	Expenses: [
		{
			Category: {
				type: String,
				required: true, // Food, Vet, Grooming, Other
			},
			Amount: {
				type: Number,
				required: true,
			},
			Date: {
				type: Date,
				default: Date.now,
			},
			Description: {
				type: String,
			}
		}
	],
	ParentID: {
		type: String,
		required: true,
	},
});

module.exports = Pet = mongoose.model("pet", petSchema);
