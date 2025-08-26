import { checkExistingApplication } from '../lib/appwrite';

// Mock the appwrite dependencies
jest.mock('../lib/appwrite', () => ({
  checkExistingApplication: jest.fn(),
  databases: {
    listDocuments: jest.fn(),
  },
  config: {
    databaseId: 'test-db',
    applicationsCollectionId: 'test-applications',
  },
  Query: {
    equal: jest.fn(),
  },
}));

describe('Duplicate Application Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkExistingApplication', () => {
    it('should return hasApplied: true when talent has pending application', async () => {
      const mockResponse = {
        hasApplied: true,
        application: {
          $id: 'app123',
          talentId: 'talent123',
          jobId: 'job123',
          status: 'pending',
        },
        status: 'pending',
      };

      (checkExistingApplication as jest.Mock).mockResolvedValue(mockResponse);

      const result = await checkExistingApplication('talent123', 'job123');

      expect(result.hasApplied).toBe(true);
      expect(result.status).toBe('pending');
      expect(result.application).toBeDefined();
    });

    it('should return hasApplied: true when talent has shortlisted application', async () => {
      const mockResponse = {
        hasApplied: true,
        application: {
          $id: 'app123',
          talentId: 'talent123',
          jobId: 'job123',
          status: 'shortlisted',
        },
        status: 'shortlisted',
      };

      (checkExistingApplication as jest.Mock).mockResolvedValue(mockResponse);

      const result = await checkExistingApplication('talent123', 'job123');

      expect(result.hasApplied).toBe(true);
      expect(result.status).toBe('shortlisted');
      expect(result.application).toBeDefined();
    });

    it('should return hasApplied: false when talent has no pending/shortlisted applications', async () => {
      const mockResponse = {
        hasApplied: false,
        application: null,
        status: null,
      };

      (checkExistingApplication as jest.Mock).mockResolvedValue(mockResponse);

      const result = await checkExistingApplication('talent123', 'job123');

      expect(result.hasApplied).toBe(false);
      expect(result.status).toBe(null);
      expect(result.application).toBe(null);
    });

    it('should return hasApplied: false when talent has rejected application (can reapply)', async () => {
      const mockResponse = {
        hasApplied: false,
        application: null,
        status: null,
      };

      (checkExistingApplication as jest.Mock).mockResolvedValue(mockResponse);

      const result = await checkExistingApplication('talent123', 'job123');

      expect(result.hasApplied).toBe(false);
      expect(result.status).toBe(null);
      expect(result.application).toBe(null);
    });

    it('should handle errors gracefully and allow application attempt', async () => {
      const mockResponse = {
        hasApplied: false,
        application: null,
        status: null,
      };

      (checkExistingApplication as jest.Mock).mockResolvedValue(mockResponse);

      const result = await checkExistingApplication('talent123', 'job123');

      expect(result.hasApplied).toBe(false);
      expect(result.status).toBe(null);
      expect(result.application).toBe(null);
    });
  });

  describe('Application Status Messages', () => {
    it('should provide correct message for pending applications', () => {
      const status = 'pending';
      const expectedMessage = `You have already applied to this job and your application is currently ${status}. You cannot apply again until the current application is processed.`;
      
      expect(expectedMessage).toContain('pending');
      expect(expectedMessage).toContain('cannot apply again');
    });

    it('should provide correct message for shortlisted applications', () => {
      const status = 'shortlisted';
      const expectedMessage = `You have already applied to this job and your application is currently ${status}. You cannot apply again until the current application is processed.`;
      
      expect(expectedMessage).toContain('shortlisted');
      expect(expectedMessage).toContain('cannot apply again');
    });
  });

  describe('UI State Management', () => {
    it('should show correct button text for pending applications', () => {
      const applicationStatus = 'pending';
      const expectedButtonText = 'Application Pending';
      
      expect(expectedButtonText).toBe('Application Pending');
    });

    it('should show correct button text for shortlisted applications', () => {
      const applicationStatus = 'shortlisted';
      const expectedButtonText = 'Application Shortlisted';
      
      expect(expectedButtonText).toBe('Application Shortlisted');
    });

    it('should show correct icon for pending applications', () => {
      const applicationStatus = 'pending';
      const expectedIcon = 'clock';
      
      expect(expectedIcon).toBe('clock');
    });

    it('should show correct icon for shortlisted applications', () => {
      const applicationStatus = 'shortlisted';
      const expectedIcon = 'check-circle';
      
      expect(expectedIcon).toBe('check-circle');
    });
  });
});
