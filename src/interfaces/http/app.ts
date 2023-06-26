import express from 'express'
import { router } from './routes';
import cors from 'cors'
import { errorHandlerMiddleware } from '../../middlewares/error-handler.middleware';
import { notFoundMiddleware } from '../../middlewares/not-found.middleware';
import helmet from 'helmet'
import { apiKeyMiddleware } from '../../middlewares/api-key.middleware';
const app = express();

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(apiKeyMiddleware)
app.use(router);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export {
  app
}