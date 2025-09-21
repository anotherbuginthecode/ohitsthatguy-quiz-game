from pymongo import MongoClient


class MongoDBClient:
    def __init__(self, uri, db_name):
        self.client = MongoClient(uri)
        self.db = self.client[db_name]

    def add_document(self, collection_name, document):
        collection = self.db[collection_name]
        result = collection.insert_one(document)
        return result.inserted_id

    def remove_document(self, collection_name, query):
        collection = self.db[collection_name]
        result = collection.delete_one(query)
        return result.deleted_count

    def update_document(self, collection_name, query, update_fields):
        collection = self.db[collection_name]
        result = collection.update_one(query, {"$set": update_fields})
        return result.modified_count
