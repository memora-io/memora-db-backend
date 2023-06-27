
import { Router } from "express";
import { SearchController } from "./search.controller";
import { SearchSchema } from "./search.schema";
import { searchDbUseCase } from "@/app/useCases/search-db";
import { searchDocumentsUseCase } from "@/app/useCases/search";

const searchSchema = new SearchSchema()
const searchController = new SearchController(
  searchSchema,
  searchDocumentsUseCase,
  searchDbUseCase
)
const searchRoutes = Router();

searchRoutes.post('/search', (req, res, next) => searchController.searchDocuments(req, res, next))
searchRoutes.post('/search-db', (req, res, next) => searchController.searchDocumentsDb(req, res, next))

export { searchRoutes }