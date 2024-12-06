import { Router } from "express";

import protectRoute from "../middleware/protectRoute";
import getFiles from "../controller/Repository/getFiles";
import getFileContent from "../controller/Repository/getFileContent";
import openRepo from "../controller/Repository/openRepo";

const repoRoute = Router();

repoRoute.post("/files", protectRoute, getFiles);

repoRoute.get("/content", protectRoute, getFileContent);

repoRoute.get("/open_repo", protectRoute, openRepo);



export default repoRoute;
