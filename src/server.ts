import "reflect-metadata";
import dotenv from 'dotenv';
dotenv.config()
import { app } from "./interfaces/http/app";

app.listen(3000, () => {
  console.log(`listening on port: 3000`)
})