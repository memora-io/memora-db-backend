import ApiKeysTable from './apiKeys';
import CollectionTable from './collections';

export default interface Database {
  api_keys: ApiKeysTable;
  collections: CollectionTable;
}