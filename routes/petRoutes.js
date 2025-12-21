const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  getPets,
  getPetsByUser,
  updatePet,
  delPet,
  createPet,
  getPetByID,
  addPetMed,
  addPetReminder,
  addPetVisit,
  updatePetVisit,
  findPetVisit,
  delPetVisit,
  delPetMed,
  updatePetMed,
  addPetVaccination,
  updatePetVaccination,
  delPetVaccination,
  updatePetReminder,
  delPetReminder,
  addPetActivity,
  addPetExpense,
  deletePetExpense,
} = require("../controllers/petController");

router.get("/getpets", auth, getPets);
router.get("/getpetbyuser/:id", auth, getPetsByUser);
router.patch("/updatepet/:id", auth, updatePet);
router.delete("/pet/:id", auth, delPet);
router.post("/pet", auth, createPet);
router.get("/pet/:id", auth, getPetByID);
router.put("/addpetmed/:id", auth, addPetMed);
router.put("/addPetReminder/:id", auth, addPetReminder);
router.put("/updatePetReminder/:id/:reminderid", auth, updatePetReminder);
router.put("/delPetReminder/:id/:reminderid", auth, delPetReminder);
router.put("/addPetVisit/:id", auth, addPetVisit);
router.put("/updatePetVisit/:id/:visitid", auth, updatePetVisit);
router.get("/findpetvisit/:id/:visitid", auth, findPetVisit);
router.put("/delPetVisit/:id/:visitid", auth, delPetVisit);
router.put("/delPetMed/:id/:medid", auth, delPetMed);
router.put("/updatePetMed/:id/:medid", auth, updatePetMed);
router.put("/addPetVaccination/:id", auth, addPetVaccination);
router.put("/updatePetVaccination/:id/:vaccid", auth, updatePetVaccination);
router.put("/delPetVaccination/:id/:vaccid", auth, delPetVaccination);
router.put("/addPetActivity/:id", auth, addPetActivity);
router.put("/addPetExpense/:id", auth, addPetExpense);
router.delete("/deletePetExpense/:id/:expenseId", auth, deletePetExpense); // Added the new route

module.exports = router;
