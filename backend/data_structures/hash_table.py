"""
IB HL Concept: Hash Table
Used for Tag Indexing. Provides O(1) average time complexity for tag lookups.
Maps tag -> list of file IDs
"""

class TagHashTable:
    def __init__(self, size=100):
        self.size = size
        # Array of lists to handle collisions via chaining
        self.table = [[] for _ in range(self.size)]

    def _hash_function(self, key: str) -> int:
        """Custom hash function to convert string tag to array index."""
        hash_val = 0
        for char in key:
            hash_val += ord(char)
        return hash_val % self.size

    def insert(self, tag: str, file_id: int):
        """Insert a file_id under a specific tag. O(1) average."""
        index = self._hash_function(tag)
        
        # Check if tag already exists in the chain
        for kvp in self.table[index]:
            if kvp[0] == tag:
                # Add file_id to existing tag list if not present
                if file_id not in kvp[1]:
                    kvp[1].append(file_id)
                return
        
        # If tag doesn't exist, append new key-value pair [tag, [file_id]]
        self.table[index].append([tag, [file_id]])

    def lookup(self, tag: str) -> list:
        """Retrieve all file_ids associated with a tag. O(1) average."""
        index = self._hash_function(tag)
        for kvp in self.table[index]:
            if kvp[0] == tag:
                return kvp[1]
        return []

    def remove_file(self, tag: str, file_id: int):
        """Remove a file_id from a tag."""
        index = self._hash_function(tag)
        for kvp in self.table[index]:
            if kvp[0] == tag:
                if file_id in kvp[1]:
                    kvp[1].remove(file_id)
                return
