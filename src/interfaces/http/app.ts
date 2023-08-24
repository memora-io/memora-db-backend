import express from 'express'
import { router } from './routes';
import cors from 'cors'
import { errorHandlerMiddleware } from '../../middlewares/error-handler.middleware';
import { notFoundMiddleware } from '../../middlewares/not-found.middleware';
import helmet from 'helmet'
const app = express();

app.use(cors())
app.use(helmet())
app.use(router);
app.use(express.json())
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export {
  app
}