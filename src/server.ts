import "reflect-metadata";
import dotenv from 'dotenv';
dotenv.config()
import { app } from "./interfaces/http/app";
import { logger } from "./utils/logger";

const PORT = 3000
app.listen(PORT, () => {
  logger(`listening on port: ${PORT}`)
})