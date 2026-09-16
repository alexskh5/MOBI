import { Router } from "express";

import {
  createDoctor,
  deleteDoctor,
  getDoctorById,
  getDoctorPatients,
  getDoctors,
  sendDoctorAccessCode,
  updateDoctor,
} from "../../controllers/doctor/doctorController";

const router = Router();

/*
  Registered in server.ts as:
  app.use("/api/doctors", doctorRoutes);
*/

router.post(
  "/",
  createDoctor,
);

router.get(
  "/",
  getDoctors,
);

/*
  Keep specific routes before /:doctorId
  so they are clear and easy to maintain.
*/
router.post(
  "/:doctorId/access-code",
  sendDoctorAccessCode,
);

router.get(
  "/:doctorId/patients",
  getDoctorPatients,
);

router.get(
  "/:doctorId",
  getDoctorById,
);

router.patch(
  "/:doctorId",
  updateDoctor,
);

router.delete(
  "/:doctorId",
  deleteDoctor,
);

export default router;
