const DocumentManager = require('./DocumentManager');
const queries = require('../../data/queries/DocumentsQueries');
const versionQueries = require('../../data/queries/VersionQueries');
const fs = require('fs');

jest.mock('../../data/queries/DocumentsQueries');
jest.mock('../../data/queries/VersionQueries');
jest.mock('fs');


describe('DocumentManager', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call queries.getAll', async () => {
      queries.getAll.mockResolvedValueOnce([]);

      await DocumentManager.getAll();

      expect(queries.getAll).toHaveBeenCalled();
      
      queries.getAll.mockRestore();
    });
  });

  describe('getById', () => {
    it('should call queries.getById with the correct ID', async () => {
      const id = 1;
      queries.getById.mockResolvedValueOnce({});

      await DocumentManager.getById(id);

      expect(queries.getById).toHaveBeenCalledWith(id);

      queries.getById.mockRestore();
    });

    it('should throw an error if the ID is not a number', async () => {
      const id = 'invalid';

      await expect(DocumentManager.getById(id)).rejects.toThrow('Document ID must be a number');
    });
  });

  describe('getVersionById', () => {
    it('should call versionQueries.getById with the correct ID', async () => {
      const id = 1;
      versionQueries.getById.mockResolvedValueOnce({});

      await DocumentManager.getVersionById(id);

      expect(versionQueries.getById).toHaveBeenCalledWith(id);

      versionQueries.getById.mockRestore();

    });

    it('should throw an error if the ID is not a number', async () => {
      const id = 'invalid';

      await expect(DocumentManager.getVersionById(id)).rejects.toThrow('Document ID must be a number');
    });
  });

  describe('add', () => {
    it('should call queries.add with the correct data', async () => {
      const data = {
        title: 'Document Title',
        date: '2022-01-01',
        file_path: '/path/to/document.pdf',
      };
      queries.add.mockResolvedValueOnce({});

      await DocumentManager.add(data);

      expect(queries.add).toHaveBeenCalledWith(data, data.file_path);

      queries.add.mockRestore();
    });

    it('should throw an error if the title is missing', async () => {
      const data = {
        date: '2022-01-01',
        file_path: '/path/to/document.pdf',
      };

      await expect(DocumentManager.add(data)).rejects.toThrow('The file name is required');
    });
  });

  describe('addVersion', () => {
    it('should call queries.addVersion with the correct data', async () => {
      const docId = 1;
      const versionDate = '2022-01-01';
      const filePath = '/path/to/version.pdf';
      queries.addVersion.mockResolvedValueOnce({});

      await DocumentManager.addVersion(docId, versionDate, filePath);

      expect(queries.addVersion).toHaveBeenCalledWith(docId, versionDate, filePath);

      queries.addVersion.mockRestore();
    });

    it('should throw an error if the document ID is missing', async () => {
      const docId = null;

      await expect(DocumentManager.addVersion(docId, '2022-01-01', '/path/to/version.pdf')).rejects.toThrow('The document ID is required');
    });
  });

  describe('updateTitle', () => {
    it('should call getById and queries.rename with the correct data', async () => {
      const id = 1;
      const title = 'New Title';
      const doc = { name: 'Old Title' };
      DocumentManager.getById = jest.fn();
      DocumentManager.getById.mockResolvedValueOnce(doc);

      queries.getById.mockResolvedValueOnce(doc);
      queries.rename.mockResolvedValueOnce({});


      await DocumentManager.updateTitle(id, title);

      expect(queries.getById).toHaveBeenCalledWith(Number(id));
      expect(queries.rename).toHaveBeenCalledWith(id, title);

      DocumentManager.getById.mockRestore();
      queries.getById.mockRestore();
      queries.rename.mockRestore();
    });

    it('should throw an error if the document ID is missing', async () => {
      const id = null;
      DocumentManager.getById = jest.fn();
      await expect(DocumentManager.updateTitle(id, 'New Title')).rejects.toThrow('Document ID is required');

      DocumentManager.getById.mockRestore();
    });

    it('should throw an error if the document is not found', async () => {
      const id = 1;
      DocumentManager.getById.mockResolvedValueOnce(null);
      await expect(DocumentManager.updateTitle(id, 'New Title')).rejects.toThrow('Document not found');

      DocumentManager.getById.mockRestore();
    });
  });

  describe('archive', () => {
    it('should call queries.archive with the correct ID', async () => {
      const id = 1;
      queries.archive.mockResolvedValueOnce({});

      await DocumentManager.archive(id);

      expect(queries.archive).toHaveBeenCalledWith(id);

      queries.archive.mockRestore();
    });

    it('should throw an error if the document ID is not a number', async () => {
      const id = 'invalid';

      await expect(DocumentManager.archive(id)).rejects.toThrow('Document ID must be a number');
    });
  });

  describe('getPdfPath', () => {
    it('should call getById and queries.getPdfPath with the correct ID', async () => {
      const id = 1;
      const doc = { name: 'Document Title' };
      DocumentManager.getById.mockResolvedValueOnce(doc);
      queries.getById.mockResolvedValueOnce(doc);
      queries.getPdfPath.mockResolvedValueOnce('/path/to/document.pdf');

      await DocumentManager.getPdfPath(id);

      expect(queries.getById).toHaveBeenCalledWith(id);
      expect(queries.getPdfPath).toHaveBeenCalledWith(id, undefined);

      DocumentManager.getById.mockRestore();
      queries.getById.mockRestore();
      queries.getPdfPath.mockRestore();
    });

    it('should throw an error if the document ID is missing', async () => {
      const id = null;

      await expect(DocumentManager.getPdfPath(id)).rejects.toThrow('Document ID is required');
    });

    it('should throw an error if the document is not found', async () => {
      const id = 1;
      DocumentManager.getById.mockResolvedValueOnce(null);

      await expect(DocumentManager.getPdfPath(id)).rejects.toThrow('Document not found');
    });
  });

  describe('getPdf', () => {
    it('should throw an error if the file path is missing', async () => {
      const id = 1;
      queries.getPdfPath = jest.fn();
      queries.getPdfPath.mockResolvedValueOnce(null);
      
      queries.getById = jest.fn();
      queries.getById.mockResolvedValueOnce({});

      await expect(DocumentManager.getPdf(id)).rejects.toThrow('[DocumentManager.getPdf] The file path is required');

      queries.getPdfPath.mockRestore();
    });

    it('should call getPdfPath and fs.existsSync with the correct file path', async () => {
      const id = 1;
      const filePath = '/path/to/document.pdf';
      fs.existsSync.mockReturnValueOnce(true);

      queries.getById = jest.fn();
      queries.getById.mockResolvedValueOnce({});

      queries.getPdfPath = jest.fn();
      queries.getPdfPath.mockResolvedValueOnce(filePath);

      // manage the statSync
      fs.statSync.mockReturnValueOnce({ size: 100 });

      await DocumentManager.getPdf(id);

      expect(queries.getPdfPath).toHaveBeenCalledWith(id, undefined);
      expect(fs.existsSync).toHaveBeenCalledWith(filePath);

      queries.getPdfPath.mockRestore();
    });

    it('should throw an error if the file does not exist', async () => {
      const id = 1;
      const filePath = '/path/to/document.pdf';
      queries.getPdfPath.mockResolvedValueOnce(filePath);
      fs.existsSync.mockReturnValueOnce(false);

      await expect(DocumentManager.getPdf(id)).rejects.toThrow('[DocumentManager.getPdfPath] Document not found');
    });
  });
});