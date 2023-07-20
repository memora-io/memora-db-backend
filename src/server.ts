import "reflect-metadata";
import dotenv from 'dotenv';
dotenv.config()
import { app } from "./interfaces/http/app";
import { logger } from "./utils/logger";

app.listen(3000, () => {
  logger(`listening on port: 3000`)
})