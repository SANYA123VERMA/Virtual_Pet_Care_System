// controllers/petController.js
const Pet = require("../models/pets");

function getUserIdFromReq(req) {
  // Many auth middlewares either set req.user = id or req.user = { id: ... }
  if (!req.user) return null;
  if (typeof req.user === "string") return req.user;
  if (typeof req.user === "object") return req.user.id || req.user._id || null;
  return null;
}

module.exports = {
  getPets: async (req, res) => {
    try {
      const dbPets = await Pet.find({});
      return res.json(dbPets);
    } catch (err) {
      console.error("getPets error:", err);
      return res.status(500).json({ error: "Failed to fetch pets" });
    }
  },

  getPetsByUser: async (req, res) => {
    try {
      const userId = req.params.id || getUserIdFromReq(req);
      if (!userId) {
        return res.status(400).json({ error: "Missing user id" });
      }
      const dbPets = await Pet.find({ ParentID: userId });
      return res.json(dbPets);
    } catch (err) {
      console.error("getPetsByUser error:", err);
      return res.status(500).json({ error: "Failed to fetch pets for user" });
    }
  },

  delPet: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: "Missing pet id" });

      const deleted = await Pet.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: "Pet not found" });

      return res.json({ message: "Pet deleted", pet: deleted });
    } catch (err) {
      console.error("delPet error:", err);
      return res.status(500).json({ error: "Failed to delete pet" });
    }
  },

  updatePet: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: "Missing pet id" });

      const updated = await Pet.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
      });
      if (!updated) return res.status(404).json({ error: "Pet not found" });

      return res.json(updated);
    } catch (err) {
      console.error("updatePet error:", err);
      return res.status(500).json({ error: "Failed to update pet" });
    }
  },

  getPetByID: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: "Missing pet id" });

      const pet = await Pet.findById(id);
      if (!pet) return res.status(404).json({ error: "Pet not found" });

      return res.json(pet);
    } catch (err) {
      console.error("getPetByID error:", err);
      return res.status(500).json({ error: "Failed to fetch pet" });
    }
  },

  createPet: async (req, res) => {
    try {
      const parentId = getUserIdFromReq(req);
      if (!parentId) {
        // If you expect clients to send ParentID in body when no auth used:
        // const parentFromBody = req.body.ParentID;
        // if (!parentFromBody) return res.status(400).json({ error: 'Missing parent id' });
        return res.status(401).json({ error: "Unauthorized: missing user" });
      }

      const newPet = new Pet({
        PetName: req.body.PetName,
        BirthDate: req.body.BirthDate,
        PetImageLoc: req.body.PetImageLoc,
        Gender: req.body.Gender,
        TypeOfPet: req.body.TypeOfPet,
        Breed: req.body.Breed,
        ParentID: parentId,
      });

      const saved = await newPet.save();
      return res.status(201).json(saved);
    } catch (err) {
      console.error("createPet error:", err);
      return res.status(500).json({ error: "Failed to create pet" });
    }
  },

  addPetMed: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: "Missing pet id" });

      const data = await Pet.findOneAndUpdate(
        { _id: id },
        { $push: { Medications: req.body } },
        { new: true }
      );
      if (!data) return res.status(404).json({ error: "Pet not found" });

      return res.json(data);
    } catch (err) {
      console.error("addPetMed error:", err);
      return res.status(500).json({ error: "Failed to add medication" });
    }
  },

  addPetVisit: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: "Missing pet id" });

      const data = await Pet.findOneAndUpdate(
        { _id: id },
        { $push: { VetVisits: req.body } },
        { new: true }
      );
      if (!data) return res.status(404).json({ error: "Pet not found" });

      return res.json(data);
    } catch (err) {
      console.error("addPetVisit error:", err);
      return res.status(500).json({ error: "Failed to add visit" });
    }
  },

  updatePetMed: async (req, res) => {
    try {
      const petId = req.params.id;
      const medId = req.params.medid;
      if (!petId || !medId)
        return res.status(400).json({ error: "Missing pet id or med id" });

      const dbModel = await Pet.findOneAndUpdate(
        { _id: petId, "Medications._id": medId },
        {
          $set: {
            "Medications.$.MedicationName": req.body.MedicationName,
            "Medications.$.DueDate": req.body.DueDate,
            "Medications.$.Dose": req.body.Dose,
            "Medications.$.Time": req.body.Time,
          },
        },
        { new: true }
      );

      if (!dbModel) return res.status(404).json({ error: "Medication not found" });
      return res.json(dbModel);
    } catch (err) {
      console.error("updatePetMed error:", err);
      return res.status(500).json({ error: "Failed to update medication" });
    }
  },

  updatePetVisit: async (req, res) => {
    try {
      const petId = req.params.id;
      const visitId = req.params.visitid;
      if (!petId || !visitId)
        return res.status(400).json({ error: "Missing pet id or visit id" });

      const dbModel = await Pet.findOneAndUpdate(
        { _id: petId, "VetVisits._id": visitId },
        {
          $set: {
            "VetVisits.$.VisitDate": req.body.VisitDate,
            "VetVisits.$.VisitNotes": req.body.VisitNotes,
          },
        },
        { new: true, upsert: false } // don't upsert into array item
      );

      if (!dbModel) return res.status(404).json({ error: "Visit not found" });
      return res.json(dbModel);
    } catch (err) {
      console.error("updatePetVisit error:", err);
      return res.status(500).json({ error: "Failed to update visit" });
    }
  },

  findPetVisit: async (req, res) => {
    try {
      const petId = req.params.id;
      const visitId = req.params.visitid;
      if (!petId || !visitId)
        return res.status(400).json({ error: "Missing pet id or visit id" });

      const dbModel = await Pet.findOne({ _id: petId, "VetVisits._id": visitId });
      if (!dbModel) return res.status(404).json({ error: "Visit not found" });
      return res.json(dbModel);
    } catch (err) {
      console.error("findPetVisit error:", err);
      return res.status(500).json({ error: "Failed to find visit" });
    }
  },

  delPetVisit: async (req, res) => {
    try {
      const petId = req.params.id;
      const visitId = req.params.visitid;
      if (!petId || !visitId)
        return res.status(400).json({ error: "Missing pet id or visit id" });

      const dbModel = await Pet.findOneAndUpdate(
        { _id: petId, "VetVisits._id": visitId },
        { $pull: { VetVisits: { _id: visitId } } },
        { new: true }
      );

      if (!dbModel) return res.status(404).json({ error: "Visit not found" });
      return res.json(dbModel);
    } catch (err) {
      console.error("delPetVisit error:", err);
      return res.status(500).json({ error: "Failed to delete visit" });
    }
  },

  delPetMed: async (req, res) => {
    try {
      const petId = req.params.id;
      const medId = req.params.medid;
      if (!petId || !medId)
        return res.status(400).json({ error: "Missing pet id or med id" });

      const dbModel = await Pet.findOneAndUpdate(
        { _id: petId, "Medications._id": medId },
        { $pull: { Medications: { _id: medId } } },
        { new: true }
      );

      if (!dbModel) return res.status(404).json({ error: "Medication not found" });
      return res.json(dbModel);
    } catch (err) {
      console.error("delPetMed error:", err);
      return res.status(500).json({ error: "Failed to delete medication" });
    }
  },

  addPetVaccination: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: "Missing pet id" });

      const data = await Pet.findOneAndUpdate(
        { _id: id },
        { $push: { Vaccinations: req.body } },
        { new: true }
      );
      if (!data) return res.status(404).json({ error: "Pet not found" });

      return res.json(data);
    } catch (err) {
      console.error("addPetVaccination error:", err);
      return res.status(500).json({ error: "Failed to add vaccination" });
    }
  },

  updatePetVaccination: async (req, res) => {
    try {
      const petId = req.params.id;
      const vaccId = req.params.vaccid;
      if (!petId || !vaccId)
        return res.status(400).json({ error: "Missing pet id or vaccination id" });

      const dbModel = await Pet.findOneAndUpdate(
        { _id: petId, "Vaccinations._id": vaccId },
        {
          $set: {
            "Vaccinations.$.Name": req.body.Name,
            "Vaccinations.$.DateAdministered": req.body.DateAdministered,
            "Vaccinations.$.NextDueDate": req.body.NextDueDate,
          },
        },
        { new: true }
      );

      if (!dbModel) return res.status(404).json({ error: "Vaccination not found" });
      return res.json(dbModel);
    } catch (err) {
      console.error("updatePetVaccination error:", err);
      return res.status(500).json({ error: "Failed to update vaccination" });
    }
  },

  delPetVaccination: async (req, res) => {
    try {
      const petId = req.params.id;
      const vaccId = req.params.vaccid;
      if (!petId || !vaccId)
        return res.status(400).json({ error: "Missing pet id or vaccination id" });

      const dbModel = await Pet.findOneAndUpdate(
        { _id: petId, "Vaccinations._id": vaccId },
        { $pull: { Vaccinations: { _id: vaccId } } },
        { new: true }
      );

      if (!dbModel) return res.status(404).json({ error: "Vaccination not found" });
      return res.json(dbModel);
    } catch (err) {
      console.error("delPetVaccination error:", err);
      return res.status(500).json({ error: "Failed to delete vaccination" });
    }
  },

  addPetReminder: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: "Missing pet id" });

      const data = await Pet.findOneAndUpdate(
        { _id: id },
        { $push: { Reminders: req.body } },
        { new: true }
      );
      if (!data) return res.status(404).json({ error: "Pet not found" });

      return res.json(data);
    } catch (err) {
      console.error("addPetReminder error:", err);
      return res.status(500).json({ error: "Failed to add reminder" });
    }
  },

  updatePetReminder: async (req, res) => {
    try {
      const petId = req.params.id;
      const reminderId = req.params.reminderid;
      if (!petId || !reminderId)
        return res.status(400).json({ error: "Missing pet id or reminder id" });

      const dbModel = await Pet.findOneAndUpdate(
        { _id: petId, "Reminders._id": reminderId },
        {
          $set: {
            "Reminders.$.Date": req.body.Date,
            "Reminders.$.Title": req.body.Title,
            "Reminders.$.Note": req.body.Note,
          },
        },
        { new: true }
      );

      if (!dbModel) return res.status(404).json({ error: "Reminder not found" });
      return res.json(dbModel);
    } catch (err) {
      console.error("updatePetReminder error:", err);
      return res.status(500).json({ error: "Failed to update reminder" });
    }
  },

  delPetReminder: async (req, res) => {
    try {
      const petId = req.params.id;
      const reminderId = req.params.reminderid;
      if (!petId || !reminderId)
        return res.status(400).json({ error: "Missing pet id or reminder id" });

      const dbModel = await Pet.findOneAndUpdate(
        { _id: petId, "Reminders._id": reminderId },
        { $pull: { Reminders: { _id: reminderId } } },
        { new: true }
      );

      if (!dbModel) return res.status(404).json({ error: "Reminder not found" });
      return res.json(dbModel);
    } catch (err) {
      console.error("delPetReminder error:", err);
      return res.status(500).json({ error: "Failed to delete reminder" });
    }
  },

  addPetActivity: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: "Missing pet id" });

      const data = await Pet.findOneAndUpdate(
        { _id: id },
        { $push: { Activities: req.body } },
        { new: true }
      );
      if (!data) return res.status(404).json({ error: "Pet not found" });

      return res.json(data);
    } catch (err) {
      console.error("addPetActivity error:", err);
      return res.status(500).json({ error: "Failed to log activity" });
    }
  },

  addPetExpense: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: "Missing pet id" });

      const data = await Pet.findOneAndUpdate(
        { _id: id },
        { $push: { Expenses: req.body } },
        { new: true }
      );
      if (!data) return res.status(404).json({ error: "Pet not found" });

      return res.json(data);
    } catch (err) {
      console.error("addPetExpense error:", err);
      return res.status(500).json({ error: "Failed to log expense" });
    }
  },

  deletePetExpense: async (req, res) => {
    try {
      const { id, expenseId } = req.params;
      if (!id || !expenseId) return res.status(400).json({ error: "Missing required ids" });

      const data = await Pet.findOneAndUpdate(
        { _id: id },
        { $pull: { Expenses: { _id: expenseId } } },
        { new: true }
      );

      if (!data) return res.status(404).json({ error: "Pet not found" });
      return res.json(data);
    } catch (err) {
      console.error("deletePetExpense error:", err);
      return res.status(500).json({ error: "Failed to delete expense" });
    }
  },
};
