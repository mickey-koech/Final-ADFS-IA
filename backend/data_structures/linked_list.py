"""
IB HL Concept: Linked List
Used for maintaining File Version History.
Each node points to the previous version, allowing traversal backward in time.
"""

class Node:
    def __init__(self, data):
        self.data = data # Dictionary or object containing version info (e.g. file_path, created_at, id)
        self.next = None

class FileVersionList:
    def __init__(self):
        self.head = None # Head represents the *latest* version
    
    def add_version(self, version_info):
        """Adds a new version to the front of the list (O(1))"""
        new_node = Node(version_info)
        new_node.next = self.head
        self.head = new_node
        return self.head
    
    def get_history(self):
        """Traverses the linked list to return full version history (O(n))"""
        history = []
        current = self.head
        while current:
            history.append(current.data)
            current = current.next
        return history
    
    def get_version(self, target_id):
        """Finds a specific version by its ID (O(n))"""
        current = self.head
        while current:
            if current.data.get("id") == target_id:
                return current.data
            current = current.next
        return None
