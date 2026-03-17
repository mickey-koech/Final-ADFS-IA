"""
IB HL Concept: Stack
Used for the Undo System for user actions (LIFO - Last In, First Out).
Supports undoing file moves, name changes, or deletions.
"""

class ActionStack:
    def __init__(self, capacity=100):
        self.items = []
        self.capacity = capacity
        
    def is_empty(self):
        return len(self.items) == 0
        
    def is_full(self):
        return len(self.items) >= self.capacity

    def push(self, action_data):
        """Push an action (e.g., {'type': 'RENAME', 'old_name': 'A', 'new_name': 'B'}) onto the stack. O(1)"""
        if self.is_full():
            self.items.pop(0) # Evict oldest if full
        self.items.append(action_data)
        
    def pop(self):
        """Pop the most recent action to undo it. O(1)"""
        if self.is_empty():
            return None
        return self.items.pop()
        
    def peek(self):
        """Look at the next action to be undone without removing it. O(1)"""
        if self.is_empty():
            return None
        return self.items[-1]
