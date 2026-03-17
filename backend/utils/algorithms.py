"""
IB HL Concept: Binary Search & Recursion
Used for efficient file searching (O(log n)) and folder traversal.
"""

def binary_search_files(sorted_files: list, target_name: str) -> list:
    """
    Binary search for a file by name.
    Expects a pre-sorted list of dictionary objects or File model objects with a 'name' attribute.
    Since multiple files can have similar prefixes, we'll return the exact match or ones containing it.
    This simple basic version returns exact matches in O(log n).
    """
    left = 0
    right = len(sorted_files) - 1
    
    # We will assume sorted_files is a list of File objects with .name attribute
    while left <= right:
        mid = (left + right) // 2
        mid_name = getattr(sorted_files[mid], "name", "")
        
        # If the target matches exactly
        if mid_name == target_name:
            return sorted_files[mid]
        # If target is less than mid_name
        elif target_name < mid_name:
            right = mid - 1
        # If target is greater than mid_name
        else:
            left = mid + 1
            
    return None


def get_all_subfolders_recursive(folder_id: int, all_folders_map: dict) -> list:
    """
    Recursively fetch all nested subfolders given a folder_id.
    all_folders_map is a dictionary mapping parent_id -> list of folder objects.
    e.g., { 1: [Folder(id=2), Folder(id=3)] }
    """
    children = all_folders_map.get(folder_id, [])
    # Base case implicitly reached when children is empty
    all_descendants = list(children)
    
    for child in children:
        all_descendants.extend(get_all_subfolders_recursive(child.id, all_folders_map))
        
    return all_descendants
