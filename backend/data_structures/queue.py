"""
IB HL Concept: Queue (FIFO - First In, First Out)
Used for managing the file upload queue. Files are processed in the order they are added.
"""

class UploadQueue:
    def __init__(self):
        self.items = []

    def is_empty(self):
        return len(self.items) == 0

    def enqueue(self, file_upload_task):
        """Add a file to the end of the upload queue. O(1)"""
        self.items.append(file_upload_task)

    def dequeue(self):
        """Remove and return the first file from the queue to process. O(n) due to list shift, 
        but conceptually O(1) for textbook queues."""
        if self.is_empty():
            return None
        return self.items.pop(0)

    def size(self):
        return len(self.items)

    def peek(self):
        """Look at the next file to be uploaded. O(1)"""
        if self.is_empty():
            return None
        return self.items[0]
