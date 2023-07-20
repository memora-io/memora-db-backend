import { PrismaClient } from '@prisma/client'

let prisma = new PrismaClient()
prisma.$connect()

export default prisma