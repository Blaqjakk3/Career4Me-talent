# Duplicate Application Prevention

## Overview

This feature prevents talents from reapplying to jobs they have already applied to with "pending" or "shortlisted" status. This ensures a better user experience and prevents duplicate applications in the system.

## Implementation Details

### Database Schema

The solution leverages the existing `applications` collection with the following relevant fields:
- `jobId`: ID of the job being applied to
- `talentId`: ID of the talent applying (user authentication ID)
- `status`: Application status (`pending`, `shortlisted`, `rejected`, `withdrawn`)

### Core Functions

#### 1. `checkExistingApplication(talentId, jobId)`

**Location**: `lib/appwrite.ts`

**Purpose**: Checks if a talent has already applied to a specific job with pending or shortlisted status.

**Parameters**:
- `talentId` (string): The talent's user authentication ID
- `jobId` (string): The job's document ID

**Returns**:
```typescript
{
  hasApplied: boolean,
  application: object | null,
  status: string | null
}
```

**Query Logic**:
```javascript
Query.equal('talentId', talentId),
Query.equal('jobId', jobId),
Query.equal('status', ['pending', 'shortlisted'])
```

#### 2. `getTalentJobApplicationStatus(talentId, jobId)`

**Location**: `lib/appwrite.ts`

**Purpose**: Gets the application status for a talent and job (including all statuses).

**Use Case**: For displaying application history or status in job listings.

### UI Components Updated

#### 1. QuickApplyModal (`components/QuickApplyModal.tsx`)

**Changes**:
- Added import for `checkExistingApplication`
- Added `onApplicationSubmitted` prop for callback functionality
- Updated `handleSubmit` to check for existing applications before allowing submission
- Shows alert with appropriate message when duplicate application is detected

**Alert Message**:
```
"Already Applied"
"You have already applied to this job and your application is currently [status]. You cannot apply again until the current application is processed."
```

#### 2. Job Details Page (`app/jobs/jobsdetails/[id].tsx`)

**Changes**:
- Added state variables: `hasApplied`, `applicationStatus`
- Added `checkApplicationStatus` function
- Added useEffect to check application status when job and user data loads
- Updated apply button UI to show different states:
  - **Pending**: Orange background with clock icon, "Application Pending" text
  - **Shortlisted**: Green background with check-circle icon, "Application Shortlisted" text
  - **No Application**: Normal blue "Quick Apply" or "Apply for this Position" button

### User Experience Flow

#### Scenario 1: First Time Application
1. User opens job details page
2. System checks for existing applications
3. No existing application found
4. Normal "Quick Apply" button is shown
5. User can proceed with application

#### Scenario 2: Pending Application Exists
1. User opens job details page
2. System checks for existing applications
3. Pending application found
4. Orange "Application Pending" button is shown (non-clickable)
5. If user somehow accesses QuickApplyModal, alert prevents submission

#### Scenario 3: Shortlisted Application Exists
1. User opens job details page
2. System checks for existing applications
3. Shortlisted application found
4. Green "Application Shortlisted" button is shown (non-clickable)
5. If user somehow accesses QuickApplyModal, alert prevents submission

#### Scenario 4: Rejected/Withdrawn Application
1. User opens job details page
2. System checks for existing applications
3. Only rejected/withdrawn applications found (these don't prevent reapplication)
4. Normal "Quick Apply" button is shown
5. User can apply again

### Error Handling

- If `checkExistingApplication` fails, it returns `hasApplied: false` to allow application attempt
- This ensures the system fails gracefully and doesn't prevent legitimate applications due to technical issues

### Testing

**Test File**: `__tests__/duplicateApplicationPrevention.test.ts`

**Test Coverage**:
- ✅ Returns correct status for pending applications
- ✅ Returns correct status for shortlisted applications  
- ✅ Allows reapplication when no pending/shortlisted applications exist
- ✅ Allows reapplication for rejected applications
- ✅ Handles errors gracefully
- ✅ UI state management for different application statuses
- ✅ Correct alert messages for different scenarios

### Benefits

1. **Prevents Duplicate Applications**: Eliminates confusion for both talents and employers
2. **Better User Experience**: Clear visual feedback about application status
3. **Data Integrity**: Maintains clean application records
4. **Employer Efficiency**: Reduces duplicate application processing
5. **System Performance**: Prevents unnecessary application creation

### Future Enhancements

1. **Job Listing Integration**: Show application status badges in job listing cards
2. **Application History**: Link to view full application details from status button
3. **Notification Integration**: Alert users when application status changes to allow reapplication
4. **Bulk Status Check**: Optimize for checking multiple jobs at once in listings

### Configuration

The system currently prevents reapplication for these statuses:
- `pending`
- `shortlisted`

Applications with these statuses allow reapplication:
- `rejected`
- `withdrawn`

To modify which statuses prevent reapplication, update the query in `checkExistingApplication`:
```javascript
Query.equal('status', ['pending', 'shortlisted', 'other_status'])
```
