# Testing the History Page

## Quick Start

### 1. Start Backend Server
```bash
cd backend
python app.py
```

Backend should be running on `http://localhost:5000`

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```

Frontend should be running on `http://localhost:3000`

## Test Scenario 1: Upload and View in History

### Step 1: Upload a Photo
1. Go to `http://localhost:3000/civilian` (or corporative)
2. Click "Upload" tab
3. Click "Choose Image" or drag & drop a trash photo
   - Try: plastic bottle, paper, glass jar, metal can
4. Wait for AI classification (should show type, confidence, eco-points)
5. Fill in weight (e.g., "1.5" kg)
6. Select a collection center
7. Click "Submit"
8. You should see success message with points earned

### Step 2: View in History
1. Click "History" tab
2. You should see your uploaded photo displayed
3. Verify:
   - ✅ Photo shows actual uploaded image (not colored placeholder)
   - ✅ Type matches AI classification
   - ✅ Weight shows what you entered
   - ✅ Status is "pending"
   - ✅ Points are displayed

## Test Scenario 2: Multiple Uploads & Filters

### Upload Different Types
1. Upload plastic bottle → Submit
2. Upload paper document → Submit
3. Upload glass jar → Submit
4. Upload metal can → Submit

### Test Filters
1. Go to History tab
2. Filter by Type dropdown:
   - Select "Plastic" → Should show only plastic submission
   - Select "All Types" → Should show all submissions
3. Filter by Status dropdown:
   - Select "Pending" → Should show all (default status)
   - Select "Approved" → Should show none (no approvals yet)

### Test Pagination
1. Upload more than 10 items
2. Check pagination controls appear
3. Click "Next" → Should load next page
4. Click "Previous" → Should go back

## Test Scenario 3: Error Handling

### Image Loading Error
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh History page
4. Look for failed image requests
5. Photos should show colored placeholders if image not found

### Backend Offline
1. Stop backend server (Ctrl+C)
2. Refresh History page
3. Should show "Failed to load submission history" error
4. Restart backend
5. Refresh again → Should work

## Expected Behavior

### Photo Display
✅ Real uploaded images appear in History table
✅ Images are clickable (can open submission details)
✅ Failed images fall back to colored type badge
✅ Images maintain aspect ratio (object-cover)

### Data Accuracy
✅ Classification type matches AI result
✅ Weight shows correct value
✅ Points calculated correctly (based on type + weight)
✅ Timestamp shows submission date/time

### Performance
✅ Photos load quickly (< 2 seconds)
✅ Pagination works smoothly
✅ Filters update instantly
✅ No console errors

## Common Issues

### Issue: Photos Not Showing
**Symptoms**: Colored placeholders instead of photos
**Cause**: Backend not serving uploads folder
**Fix**: Check `backend/app/__init__.py` has `/uploads/<filename>` route

### Issue: "No file provided" Error
**Symptoms**: Upload fails with 400 error
**Cause**: FormData not sent correctly
**Fix**: Check `frontend/src/lib/api.js` doesn't set Content-Type for FormData

### Issue: Empty History
**Symptoms**: "No submissions yet" message
**Cause**: No data in submissions_db (in-memory storage)
**Fix**: Upload at least one photo first

### Issue: 404 on Image URLs
**Symptoms**: Network tab shows 404 for `/uploads/xyz.jpg`
**Cause**: File not saved or wrong file_id
**Fix**: 
1. Check `backend/uploads/` folder has .jpg files
2. Verify file_id in submission matches filename

## Debug Checklist

### Backend
- [ ] Server running on port 5000
- [ ] `/uploads/<filename>` route registered
- [ ] `backend/uploads/` folder exists
- [ ] Files saved with UUID.jpg naming
- [ ] CORS allows localhost:3000

### Frontend
- [ ] API URL set to `http://localhost:5000/api`
- [ ] History component loads submissions
- [ ] Image URLs constructed correctly
- [ ] Error handling on image load failure

### Network
- [ ] GET `/api/submissions/history` returns 200
- [ ] Response includes `file_id` field
- [ ] GET `/uploads/{file_id}.jpg` returns image
- [ ] Content-Type: image/jpeg

## Success Criteria

✅ **Upload Flow**
- Photo uploads successfully
- AI classification completes
- Form submission creates database entry
- Success message with points shown

✅ **History Display**
- Uploaded photos appear in table
- Classification data accurate
- Filters work correctly
- Pagination functional

✅ **Image Handling**
- Real photos load and display
- Fallback works on error
- Images maintain quality
- Loading is fast

## Next Steps After Testing

1. **If Everything Works**:
   - Test with different image types (JPG, PNG)
   - Test with large images (> 2MB)
   - Test with 50+ submissions
   - Prepare for database migration

2. **If Issues Found**:
   - Check browser console for errors
   - Check backend logs for errors
   - Verify file paths are correct
   - Test API endpoints with Postman
