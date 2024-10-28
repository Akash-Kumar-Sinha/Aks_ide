import { Router } from "express";

import createRepo from "../controller/Repository/createRepo";
import protectRoute from "../middleware/protectRoute";
import getFiles from "../controller/Repository/getFiles";

const repoRoute = Router();

repoRoute.post("/template", protectRoute, createRepo);

repoRoute.post("/files", protectRoute, getFiles);


export default repoRoute;
