import { Router } from "express";

import createRepo from "../controller/Repository/createRepo";
import protectRoute from "../middleware/protectRoute";

const repoRoute = Router();

repoRoute.post("/template", protectRoute, createRepo);

export default repoRoute;
