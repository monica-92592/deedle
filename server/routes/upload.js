const express = require('express');
const multer = require('multer');
const IntelligentCSVParser = require('../services/csvParser');
const PropertyAnalysisEngine = require('../services/analysisEngine');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const parser = new IntelligentCSVParser();
const analyzer = new PropertyAnalysisEngine();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Upload and process CSV file
router.post('/csv', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.id;
    const filename = req.file.originalname;
    const csvContent = req.file.buffer.toString('utf-8');

    console.log(`Processing CSV file: ${filename} for user: ${userId}`);

    // Parse CSV with intelligent column detection
    const parseResult = await parser.parseCSV(csvContent, filename);
    
    // Validate data quality
    const validation = parser.validateData(parseResult.data);
    
    if (validation.qualityScore < 50) {
      return res.status(400).json({
        error: 'Poor data quality detected',
        validation: validation
      });
    }

    // Create dataset record
    const datasetResult = await pool.query(
      `INSERT INTO property_datasets (user_id, filename, total_properties, status) 
       VALUES ($1, $2, $3, 'processing') RETURNING id`,
      [userId, filename, parseResult.data.length]
    );
    
    const datasetId = datasetResult.rows[0].id;

    // Analyze properties
    const analyzedProperties = analyzer.analyzeProperties(parseResult.data);
    
    // Store properties in database
    const insertPromises = analyzedProperties.map(async (property) => {
      const query = `
        INSERT INTO properties (
          dataset_id, parcel_id, power_to_sale_date, tax_area, location,
          delinquent_amount, land_value, improvement_value, property_description,
          address, property_type, acreage, equity_ratio, delinquency_age,
          investment_score, estimated_redemption
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `;
      
      const values = [
        datasetId,
        property.parcelId,
        property.powerToSaleDate,
        property.taxArea,
        property.location,
        property.delinquentAmount,
        property.landValue,
        property.improvementValue,
        property.propertyDescription,
        property.address,
        property.propertyType,
        property.acreage,
        property.equityRatio,
        property.delinquencyAge,
        property.investmentScore,
        property.estimatedRedemption
      ];
      
      return pool.query(query, values);
    });

    await Promise.all(insertPromises);

    // Update dataset status
    await pool.query(
      'UPDATE property_datasets SET status = $1, processed_properties = $2 WHERE id = $3',
      ['completed', analyzedProperties.length, datasetId]
    );

    // Generate portfolio statistics
    const portfolioStats = analyzer.generatePortfolioStats(analyzedProperties);

    res.json({
      success: true,
      datasetId,
      totalProperties: analyzedProperties.length,
      validation,
      columnMapping: parseResult.columnMapping,
      portfolioStats,
      message: `Successfully processed ${analyzedProperties.length} properties`
    });

  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process CSV file',
      message: error.message 
    });
  }
});

// Get upload status
router.get('/status/:datasetId', authenticateToken, async (req, res) => {
  try {
    const { datasetId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM property_datasets WHERE id = $1 AND user_id = $2',
      [datasetId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    const dataset = result.rows[0];
    res.json({
      id: dataset.id,
      filename: dataset.filename,
      status: dataset.status,
      totalProperties: dataset.total_properties,
      processedProperties: dataset.processed_properties,
      uploadDate: dataset.upload_date
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to get upload status' });
  }
});

// Get user's datasets
router.get('/datasets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, filename, upload_date, total_properties, processed_properties, status
       FROM property_datasets 
       WHERE user_id = $1 
       ORDER BY upload_date DESC`,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Get datasets error:', error);
    res.status(500).json({ error: 'Failed to get datasets' });
  }
});

// Delete dataset
router.delete('/datasets/:datasetId', authenticateToken, async (req, res) => {
  try {
    const { datasetId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const dataset = await pool.query(
      'SELECT id FROM property_datasets WHERE id = $1 AND user_id = $2',
      [datasetId, userId]
    );

    if (dataset.rows.length === 0) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Delete dataset (cascade will delete properties)
    await pool.query('DELETE FROM property_datasets WHERE id = $1', [datasetId]);

    res.json({ success: true, message: 'Dataset deleted successfully' });

  } catch (error) {
    console.error('Delete dataset error:', error);
    res.status(500).json({ error: 'Failed to delete dataset' });
  }
});

module.exports = router;
