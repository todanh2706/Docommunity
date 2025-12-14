# Manual Test Cases

## Function 01: Use Case Filtering Documents (by Sort Order & Tags)

- [ ] **UC01-UI01**: Sort by "Newest" with Database Verification
  - **Steps**:
    1. Navigate to Workspace.
    2. Select Filter > "Newest".
    3. Compare UI order with Database created_at timestamps.
  - **Expected Result**: The UI displays documents matching the exact descending order of the Database timestamps.

- [ ] **UC01-UI02**: Sort by "A-Z" with Special Characters
  - **Steps**:
    1. Select Filter > "A-Z".
    2. Verify sorting logic for non-alphabetic characters.
  - **Expected Result**: System sorts strictly by ASCII/Unicode value.

- [ ] **UC01-UI03**: System sorts strictly by ASCII/Unicode value (Tag Filtering)
  - **Steps**:
    1. Click Tags button.
    2. Select "Tag A".
    3. Verify result count against Database query for Tag A.
  - **Expected Result**: The UI count matches the Database count exactly. Documents with "Tag B" or no tags are strictly excluded.

- [ ] **UC01-UI04**: Combined Filtering (Sort + Tag)
  - **Steps**:
    1. Apply a Tag filter (e.g., "Work").
    2. Apply Sort > "Z-A".
  - **Expected Result**: The system maintains the Tag filter (only "Work" docs shown) but reorders them Z-A. (Verifies the "filtered and/or sorted" condition).

- [ ] **UC01-UI05**: Alternative Flow: No Match Retention
  - **Steps**:
    1. Click Tags.
    2. Select a tag that belongs to zero documents.
  - **Expected Result**: The system must not show an empty list. It must revert/keep the current "Newest" list view unchanged as per the Alternative Flow.

- [ ] **UC01-UI06**: Empty Workspace Handling
  - **Steps**:
    1. Navigate to Workspace.
    2. Attempt to click Filter or Tags buttons.
  - **Expected Result**: System handles the empty state gracefully (buttons disabled or showing "No options" without crashing).

- [ ] **UC01-UI07**: Large Dataset Performance (Load Test)
  - **Steps**:
    1. Click Filter > "Oldest".
    2. Measure time to render.
  - **Expected Result**: The list re-renders within acceptable performance limits (< 2 seconds) without timeout errors.

- [ ] **UC01-UI08**: Tag List Synchronization
  - **Steps**:
    1. Refresh Workspace.
    2. Click Tags button.
  - **Expected Result**: The deleted tag should not appear in the "available options" list.

- [ ] **UC01-UI09**: Session Consistency
  - **Steps**:
    1. Navigate to a different page.
    2. Click "Back" or return to Workspace.
  - **Expected Result**: System retains the user's last selected sort order ("Z-A") rather than resetting to default.

- [ ] **UC01-UI10**: UI Responsiveness (Mobile/Desktop)
  - **Steps**:
    1. Access Workspace.
    2. Open Filter options.
  - **Expected Result**: The "Newest/Oldest/A-Z" dropdown renders correctly within the viewport and is clickable.

---

## Function 02: Edit Tags to a Document

- [ ] **UC02-UI01**: Open Tag Editor from document menu
  - **Steps**:
    1. Log in with a valid user account.
    2. Navigate to workspace with at least one document.
    3. Click the vertical dots (⋮) of a document.
    4. Click “Edit tags” in the dropdown menu.
  - **Expected Result**: System displays the Tag Editor dialog. Available tags are listed. Tags currently assigned to the document are highlighted.

- [ ] **UC02-UI02**: Add a new single tag to a document (no existing tags)
  - **Steps**:
    1. Open Tag Editor for a document with no tags.
    2. Select one tag from the available tags list.
    3. Click Save.
  - **Expected Result**: System associates the selected tag with the document. The selected tag is shown in the document’s metadata area.

- [ ] **UC02-UI03**: Add multiple tags to a document
  - **Steps**:
    1. Open Tag Editor for a document.
    2. Select multiple tags (≥ 2) from the list.
    3. Click Save.
  - **Expected Result**: All selected tags are attached to the document. All selected tags appear in the metadata area.

- [ ] **UC02-UI04**: Remove a single existing tag
  - **Steps**:
    1. Open Tag Editor for a document that already has ≥ 1 tag.
    2. Deselect one of the currently assigned tags.
    3. Keep at least one other tag selected.
    4. Click Save.
  - **Expected Result**: Deselected tag is removed from the document. Remaining tags are still associated and shown in metadata.

- [ ] **UC02-UI05**: Remove all tags from a document
  - **Steps**:
    1. Open Tag Editor for a document that already has tags.
    2. Deselect all currently assigned tags.
    3. Click Save.
  - **Expected Result**: Document has no tags associated. No tags are displayed in document’s metadata area.

- [ ] **UC02-UI06**: Cancel tag editing (no change after Cancel)
  - **Steps**:
    1. Open Tag Editor for a document with existing tags.
    2. Change tag selection (add or remove tags).
    3. Click Cancel (or Cancel button).
  - **Expected Result**: Tag Editor dialog is closed. No changes are applied to the document tags.

- [ ] **UC02-UI07**: Close Tag Editor via “X” button or ESC key
  - **Steps**:
    1. Open Tag Editor for any document.
    2. Modify tag selection.
    3. Close the dialog using “X” icon or ESC key.
  - **Expected Result**: Tag Editor dialog is closed. Changes are not saved.

- [ ] **UC02-UI08**: User without permission cannot edit tags
  - **Steps**:
    1. Log in with a user without permission to edit document tags.
    2. Navigate to a workspace document.
    3. Click the vertical dots (⋮) of the document.
  - **Expected Result**: Edit tags option is not visible OR system shows an appropriate error message and disallows tag editing.

- [ ] **UC02-UI09**: Tags updated and usable in filtering/search
  - **Steps**:
    1. Open Tag Editor and add at least one new tag to a document.
    2. Click Save.
    3. Go to the document list view.
    4. Use filter/search by the new tag.
  - **Expected Result**: Document appears in the result list when filtering/searching by the newly added tag.

- [ ] **UC02-UI10**: Prevent duplicate tags on the same document
  - **Steps**:
    1. Open Tag Editor for a document.
    2. Try to select a tag that is already assigned.
    3. Click Save.
  - **Expected Result**: System ensures each tag is associated only once per document.

---

## Function 03: Create Document

- [ ] **UC03-UI01**: Create Valid Document (Public)
  - **Steps**:
    1. Enter Document Name (e.g., "doc").
    2. Enter Password (if applicable/required per UI, though CSV says "abcd").
    3. Choose "Public" options.
    4. Click "Create Note" button.
  - **Expected Result**: Modal closes. System creates the document. User is redirected to the Markdown Editor. Document privacy is set to Public.

- [ ] **UC03-UI02**: Create Valid Document (Private)
  - **Steps**:
    1. Enter Document Name.
    2. Choose "Private" options.
    3. Click "Create Note" button.
  - **Expected Result**: Modal closes. System creates the document. User is redirected to the Markdown Editor. Document privacy is set to Private.

- [ ] **UC03-UI03**: Verify Duplicate Name Validation
  - **Steps**:
    1. Click "Add Note".
    2. Enter a name that already exists in the current folder.
    3. Choose "Private/Public" options.
    4. Click "Create Note" button.
  - **Expected Result**: System does not create the document. An error message is displayed (e.g., "Name already exists").

- [ ] **UC03-UI04**: Verify Empty Name Validation
  - **Steps**:
    1. Click "Add Note".
    2. Leave the Name field empty.
    3. Click "Create Note" button.
  - **Expected Result**: System prevents creation or shows an error.

- [ ] **UC03-UI05**: Verify Max Character Length for Name
  - **Steps**:
    1. Click "Add Note".
    2. Enter a name with max allowed characters + 1.
    3. Click "Create Note" button.
  - **Expected Result**: System prevents creation or truncates the name and shows an error.

- [ ] **UC03-UI06**: Verify Special Characters in Name
  - **Steps**:
    1. Click "Add Note".
    2. Enter a name containing allowed special characters (e.g., hyphens, underscores).
    3. Click "Create Note" button.
  - **Expected Result**: Document is created successfully with the exact name provided.

- [ ] **UC03-UI07**: Verify Space Trimming in Name
  - **Steps**:
    1. Click "Add Note".
    2. Enter a name with leading/trailing spaces.
    3. Click "Create Note" button.
  - **Expected Result**: Document is created as Spaced Doc (System trims whitespace automatically).

- [ ] **UC03-UI08**: Cancel Document Creation
  - **Steps**:
    1. Click "Add Note".
    2. Enter a name, set privacy.
    3. Click the "Cancel" button.
  - **Expected Result**: Modal closes. No document is created.

- [ ] **UC03-UI09**: Verify UI of "Add Note" trigger
  - **Steps**:
    1. Navigate to the Workspace view.
    2. Observe the interface.
  - **Expected Result**: The "Add Note" button is visible and clickable.

- [ ] **UC03-UI10**: Verify Modal Display
  - **Steps**:
    1. Click the "Add Note" button.
  - **Expected Result**: A modal appears containing Text field for "Document Name", Privacy toggle, "Create Note" button, "Cancel" button.

---

## Function 04: View Bookmark

- [ ] **UC04-UI01**: Verify UI - Bookmark Button Visibility
  - **Steps**:
    1. Log in to the system.
    2. Observe the workspace sidebar.
  - **Expected Result**: The Bookmark button is visible and clickable in the sidebar.

- [ ] **UC04-UI02**: Verify Basic Flow - View list with existing bookmarks
  - **Steps**:
    1. Ensure the logged-in user has at least one document bookmarked.
    2. Click the Bookmark button from the sidebar.
  - **Expected Result**: The system displays a list of bookmarked documents including titles and brief metadata.

- [ ] **UC04-UI03**: Verify Alternative Flow - View list with NO bookmarks
  - **Steps**:
    1. Ensure the logged-in user has zero bookmarked documents.
    2. Click the Bookmark button from the sidebar.
  - **Expected Result**: The system displays the message: "No bookmarked documents found." (or similar).

- [ ] **UC04-UI04**: Verify Metadata Display
  - **Steps**:
    1. Click the Bookmark button.
    2. Inspect the details of a specific document in the list.
  - **Expected Result**: The entry clearly shows the Document Title and metadata (e.g., Date, Author).

- [ ] **UC04-UI05**: Verify "Quick Access" (Navigation)
  - **Steps**:
    1. Open the Bookmark list.
    2. Click on the title of a bookmarked document.
  - **Expected Result**: The system navigates the user to the document view for that specific file.

- [ ] **UC04-UI06**: Verify Data Integrity (Newly Added)
  - **Steps**:
    1. Navigate to a document that is NOT bookmarked.
    2. Add it to bookmarks.
    3. Click the Bookmark button in the sidebar.
  - **Expected Result**: The newly added document appears in the bookmark list immediately.

- [ ] **UC04-UI07**: Verify Data Integrity (After Removal)
  - **Steps**:
    1. Open the Bookmark list.
    2. Remove a bookmark.
    3. Close and re-open the Bookmark list.
  - **Expected Result**: The removed document is no longer visible in the Bookmark list.

- [ ] **UC04-UI08**: Verify Persistence after Logout
  - **Steps**:
    1. View Bookmark list to confirm items exist.
    2. Log out and log in again.
    3. Click the Bookmark button.
  - **Expected Result**: The list displays the exact same documents.

- [ ] **UC04-UI09**: Verify User Isolation (Privacy)
  - **Steps**:
    1. Log in as User A and bookmark "Document X".
    2. Log out and log in as User B.
    3. Click the Bookmark button.
  - **Expected Result**: User B does NOT see "Document X" in their list.

- [ ] **UC04-UI10**: Verify Large List Handling (UI Stability)
  - **Steps**:
    1. Ensure the user has a large number of bookmarks (e.g., 20+).
    2. Click the Bookmark button.
    3. Scroll through the list.
  - **Expected Result**: List loads within reasonable time. Scrollbar appears. Layout does not break.

---

## Function 05: Use Case Filtering Documents (By search bar)

- [ ] **UC05-UI01**: Search with a keyword that has matching documents
  - **Steps**:
    1. Enter a keyword (e.g., "design").
    2. Press Enter or click Search.
  - **Expected Result**: List of matching documents is displayed.

- [ ] **UC05-UI02**: Search with a keyword that has no matching documents
  - **Steps**:
    1. Enter a keyword that does not exist (e.g., "xyz123").
    2. Press Enter or click Search.
  - **Expected Result**: "No results found" message is displayed.

- [ ] **UC05-UI03**: Search with empty keyword
  - **Steps**:
    1. Leave search box empty.
    2. Press Enter or click Search.
  - **Expected Result**: System does not execute search OR shows a warning. Application remains stable.

- [ ] **UC05-UI04**: Search should match in both title and content
  - **Steps**:
    1. Identify document with keyword only in content.
    2. Search for that keyword.
  - **Expected Result**: Document is found and displayed.

- [ ] **UC05-UI05**: Search is case-insensitive
  - **Steps**:
    1. Search for "design", "DESIGN", "Design".
  - **Expected Result**: Results should be identical.

- [ ] **UC05-UI06**: Search with leading and trailing spaces
  - **Steps**:
    1. Search for " design ".
  - **Expected Result**: System trims spaces and returns correct results (same as "design").

- [ ] **UC05-UI07**: Search with multiple-word phrase
  - **Steps**:
    1. Search for "system design".
  - **Expected Result**: Documents containing the full phrase are displayed.

- [ ] **UC05-UI08**: Search with special characters
  - **Steps**:
    1. Search for "C++" or "Node.js".
  - **Expected Result**: System correctly handles special characters and returns matches.

- [ ] **UC05-UI09**: Search with Unicode / accented characters
  - **Steps**:
    1. Search for accented word (e.g., "tài liệu").
  - **Expected Result**: Documents with matching accented characters are displayed.

- [ ] **UC05-UI10**: Search performance under normal load
  - **Steps**:
    1. Enter common keyword.
    2. Measure response time.
  - **Expected Result**: Results appear within 2 seconds. UI remains responsive.
