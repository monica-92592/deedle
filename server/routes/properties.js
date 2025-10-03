const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get properties with filtering and pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      datasetId,
      minScore = 0,
      maxScore = 100,
      minEquityRatio = 0,
      maxEquityRatio = 999999,
      minAmount = 0,
      maxAmount = 999999999,
      propertyType,
      location,
      sortBy = 'investment_score',
      sortOrder = 'DESC',
      page = 1,
      limit = 50
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build WHERE clause
    let whereConditions = ['p.dataset_id IN (SELECT id FROM property_datasets WHERE user_id = $1)'];
    let queryParams = [userId];
    let paramCount = 1;

    if (datasetId) {
      paramCount++;
      whereConditions.push(`p.dataset_id = $${paramCount}`);
      queryParams.push(datasetId);
    }

    if (minScore !== undefined) {
      paramCount++;
      whereConditions.push(`p.investment_score >= $${paramCount}`);
      queryParams.push(minScore);
    }

    if (maxScore !== undefined) {
      paramCount++;
      whereConditions.push(`p.investment_score <= $${paramCount}`);
      queryParams.push(maxScore);
    }

    if (minEquityRatio !== undefined) {
      paramCount++;
      whereConditions.push(`p.equity_ratio >= $${paramCount}`);
      queryParams.push(minEquityRatio);
    }

    if (maxEquityRatio !== undefined) {
      paramCount++;
      whereConditions.push(`p.equity_ratio <= $${paramCount}`);
      queryParams.push(maxEquityRatio);
    }

    if (minAmount !== undefined) {
      paramCount++;
      whereConditions.push(`p.delinquent_amount >= $${paramCount}`);
      queryParams.push(minAmount);
    }

    if (maxAmount !== undefined) {
      paramCount++;
      whereConditions.push(`p.delinquent_amount <= $${paramCount}`);
      queryParams.push(maxAmount);
    }

    if (propertyType) {
      paramCount++;
      whereConditions.push(`p.property_type = $${paramCount}`);
      queryParams.push(propertyType);
    }

    if (location) {
      paramCount++;
      whereConditions.push(`(p.location ILIKE $${paramCount} OR p.address ILIKE $${paramCount})`);
      queryParams.push(`%${location}%`);
    }

    const whereClause = whereConditions.join(' AND ');
    
    // Validate sort column
    const allowedSortColumns = [
      'investment_score', 'equity_ratio', 'delinquent_amount', 
      'delinquency_age', 'created_at', 'parcel_id'
    ];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'investment_score';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM properties p
      WHERE ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].total);

    // Get properties
    const propertiesQuery = `
      SELECT 
        p.*,
        pd.filename as dataset_name,
        pd.upload_date
      FROM properties p
      JOIN property_datasets pd ON p.dataset_id = pd.id
      WHERE ${whereClause}
      ORDER BY p.${sortColumn} ${orderDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    queryParams.push(parseInt(limit), offset);
    const propertiesResult = await pool.query(propertiesQuery, queryParams);

    res.json({
      properties: propertiesResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Failed to get properties' });
  }
});

// Get single property details
router.get('/:propertyId', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT 
        p.*,
        pd.filename as dataset_name,
        pd.upload_date,
        w.notes as watchlist_notes,
        w.priority as watchlist_priority,
        w.created_at as watchlist_date
      FROM properties p
      JOIN property_datasets pd ON p.dataset_id = pd.id
      LEFT JOIN watchlists w ON p.id = w.property_id AND w.user_id = $1
      WHERE p.id = $2 AND pd.user_id = $1
    `, [userId, propertyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = result.rows[0];
    
    // Add calculated fields
    property.is_watchlisted = !!property.watchlist_notes;
    property.total_property_value = (property.land_value || 0) + (property.improvement_value || 0);
    property.potential_profit = property.total_property_value - property.estimated_redemption;

    res.json(property);

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to get property' });
  }
});

// Add property to watchlist
router.post('/:propertyId/watchlist', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { notes, priority = 'medium' } = req.body;
    const userId = req.user.id;

    // Verify property ownership
    const propertyCheck = await pool.query(`
      SELECT p.id FROM properties p
      JOIN property_datasets pd ON p.dataset_id = pd.id
      WHERE p.id = $1 AND pd.user_id = $2
    `, [propertyId, userId]);

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Add to watchlist
    await pool.query(`
      INSERT INTO watchlists (user_id, property_id, notes, priority)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, property_id) 
      DO UPDATE SET notes = $3, priority = $4, created_at = CURRENT_TIMESTAMP
    `, [userId, propertyId, notes, priority]);

    res.json({ success: true, message: 'Property added to watchlist' });

  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// Remove property from watchlist
router.delete('/:propertyId/watchlist', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    await pool.query(
      'DELETE FROM watchlists WHERE user_id = $1 AND property_id = $2',
      [userId, propertyId]
    );

    res.json({ success: true, message: 'Property removed from watchlist' });

  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

// Get user's watchlist
router.get('/watchlist/all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        p.*,
        pd.filename as dataset_name,
        w.notes as watchlist_notes,
        w.priority as watchlist_priority,
        w.created_at as watchlist_date
      FROM watchlists w
      JOIN properties p ON w.property_id = p.id
      JOIN property_datasets pd ON p.dataset_id = pd.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, parseInt(limit), offset]);

    res.json(result.rows);

  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ error: 'Failed to get watchlist' });
  }
});

// Export properties to CSV
router.get('/export/csv', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { datasetId, minScore = 0 } = req.query;

    let whereClause = 'pd.user_id = $1';
    let queryParams = [userId];

    if (datasetId) {
      whereClause += ' AND p.dataset_id = $2';
      queryParams.push(datasetId);
    }

    if (minScore) {
      const paramIndex = queryParams.length + 1;
      whereClause += ` AND p.investment_score >= $${paramIndex}`;
      queryParams.push(minScore);
    }

    const result = await pool.query(`
      SELECT 
        p.parcel_id,
        p.power_to_sale_date,
        p.tax_area,
        p.location,
        p.delinquent_amount,
        p.land_value,
        p.improvement_value,
        p.property_description,
        p.address,
        p.property_type,
        p.equity_ratio,
        p.delinquency_age,
        p.investment_score,
        p.estimated_redemption
      FROM properties p
      JOIN property_datasets pd ON p.dataset_id = pd.id
      WHERE ${whereClause}
      ORDER BY p.investment_score DESC
    `, queryParams);

    // Convert to CSV
    const headers = [
      'Parcel ID', 'Power to Sale Date', 'Tax Area', 'Location',
      'Delinquent Amount', 'Land Value', 'Improvement Value',
      'Property Description', 'Address', 'Property Type',
      'Equity Ratio', 'Delinquency Age (days)', 'Investment Score',
      'Estimated Redemption'
    ];

    const csvRows = result.rows.map(row => [
      row.parcel_id,
      row.power_to_sale_date,
      row.tax_area,
      row.location,
      row.delinquent_amount,
      row.land_value,
      row.improvement_value,
      `"${(row.property_description || '').replace(/"/g, '""')}"`,
      `"${(row.address || '').replace(/"/g, '""')}"`,
      row.property_type,
      row.equity_ratio,
      row.delinquency_age,
      row.investment_score,
      row.estimated_redemption
    ]);

    const csvContent = [headers, ...csvRows]
      .map(row => row.join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="properties_export.csv"');
    res.send(csvContent);

  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;
