import "reflect-metadata";
import dotenv from 'dotenv';
dotenv.config()
import { app } from "./interfaces/http/app";
import { environment } from "./config/environment";

app.listen(3000, () => {
  console.log(`listening on port: ${environment.PORT}`)
})