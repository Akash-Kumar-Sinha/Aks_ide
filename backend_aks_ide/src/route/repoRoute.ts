import { Router } from "express";

import createRepo from "../controller/Repository/createRepo";
import protectRoute from "../middleware/protectRoute";
import getFiles from "../controller/Repository/getFiles";
import getFileContent from "../controller/Repository/getFileContent";

const repoRoute = Router();

repoRoute.post("/template", protectRoute, createRepo);

repoRoute.post("/files", protectRoute, getFiles);

repoRoute.get("/content", protectRoute, getFileContent);



export default repoRoute;
