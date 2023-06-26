import { Kysely } from 'kysely'
import { LibsqlDialect } from '@libsql/kysely-libsql'
import Database from '@/types/db/database'
import CollectionsTable from '@/types/db/collections';

export interface IDbCollection {
  id: string;
  owner_id: string;
  collection_name: string;
}

export class DbClient {
  private client: Kysely<Database>;
  constructor() {
    this.client = new Kysely<Database>({
      dialect: new LibsqlDialect({
        url: process.env.LIBSQL_DB_URL,
        authToken: process.env.LIBSQL_DB_AUTH_TOKEN
      })
    })
  }

  async createCollection(collectionData: IDbCollection): Promise<IDbCollection> {
    const callName = `${this.constructor.name}-${this.createCollection.name}`
    console.log(`${callName} - input`, collectionData)

    const data = await this.client.insertInto('collections').values({
      id: collectionData.id,
      name: collectionData.collection_name,
      owner_id: collectionData.owner_id
    }).executeTakeFirst()

    const output = {
      id: collectionData.id,
      collection_name: collectionData.collection_name,
      owner_id: collectionData.owner_id
    }
    console.log(`${callName} - output`, output)
    return output
  }

  async deleteCollection(collectionId: string) {
    const callName = `${this.constructor.name}-${this.deleteCollection.name}`
    console.log(`${callName} - input`, collectionId)

    await this.client.deleteFrom('collections')
      .where('collections.id', '=', collectionId)
      .execute()
  }

  async findCollection(collectionName: string, ownerId: string): Promise<IDbCollection | null> {
    const callName = `${this.constructor.name}-${this.findCollection.name}`
    console.log(`${callName} - input`, { collectionName, ownerId })

    const collection: CollectionsTable | null = await this.client.selectFrom('collections')
      .selectAll()
      .where('collections.name', '=', collectionName)
      .where('collections.owner_id', '=', ownerId)
      .executeTakeFirst() as CollectionsTable
    if (!collection) {
      console.log(`${callName} - output`, null)
      return null
    }
    const output = {
      id: collection.id,
      collection_name: collection.name,
      owner_id: collection.owner_id
    }

    console.log(`${callName} - output`, output)
    return output
  }

  async listCollections(ownerId: string): Promise<IDbCollection[] | null> {
    const callName = `${this.constructor.name}-${this.findCollection.name}`
    console.log(`${callName} - input`, { ownerId })

    const collections: CollectionsTable[] | null = await this.client.selectFrom('collections')
      .selectAll()
      .where('collections.owner_id', '=', ownerId)
      .execute() as CollectionsTable[]
    if (!collections) {
      console.log(`${callName} - output`, null)
      return null
    }
    const output = collections.map(collection =>
    ({
      id: collection.id,
      collection_name: collection.name,
      owner_id: collection.owner_id
    })
    )

    console.log(`${callName} - output`, output)
    return output
  }
}