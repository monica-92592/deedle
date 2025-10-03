const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get portfolio analytics
router.get('/portfolio/:datasetId', authenticateToken, async (req, res) => {
  try {
    const { datasetId } = req.params;
    const userId = req.user.id;

    // Verify dataset ownership
    const datasetCheck = await pool.query(
      'SELECT id FROM property_datasets WHERE id = $1 AND user_id = $2',
      [datasetId, userId]
    );

    if (datasetCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Get portfolio statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_properties,
        AVG(investment_score) as avg_score,
        AVG(equity_ratio) as avg_equity_ratio,
        SUM(delinquent_amount) as total_delinquent,
        SUM(land_value + improvement_value) as total_property_value,
        AVG(delinquency_age) as avg_delinquency_age,
        COUNT(CASE WHEN investment_score >= 70 THEN 1 END) as high_score_count,
        COUNT(CASE WHEN investment_score >= 50 AND investment_score < 70 THEN 1 END) as medium_score_count,
        COUNT(CASE WHEN investment_score < 50 THEN 1 END) as low_score_count
      FROM properties 
      WHERE dataset_id = $1
    `;

    const statsResult = await pool.query(statsQuery, [datasetId]);
    const stats = statsResult.rows[0];

    // Get property type distribution
    const typeQuery = `
      SELECT 
        property_type,
        COUNT(*) as count,
        AVG(investment_score) as avg_score
      FROM properties 
      WHERE dataset_id = $1 AND property_type IS NOT NULL
      GROUP BY property_type
      ORDER BY count DESC
    `;

    const typeResult = await pool.query(typeQuery, [datasetId]);

    // Get score distribution for chart
    const scoreDistributionQuery = `
      SELECT 
        CASE 
          WHEN investment_score >= 90 THEN '90-100'
          WHEN investment_score >= 80 THEN '80-89'
          WHEN investment_score >= 70 THEN '70-79'
          WHEN investment_score >= 60 THEN '60-69'
          WHEN investment_score >= 50 THEN '50-59'
          ELSE '0-49'
        END as score_range,
        COUNT(*) as count
      FROM properties 
      WHERE dataset_id = $1
      GROUP BY 
        CASE 
          WHEN investment_score >= 90 THEN '90-100'
          WHEN investment_score >= 80 THEN '80-89'
          WHEN investment_score >= 70 THEN '70-79'
          WHEN investment_score >= 60 THEN '60-69'
          WHEN investment_score >= 50 THEN '50-59'
          ELSE '0-49'
        END
      ORDER BY score_range DESC
    `;

    const scoreDistributionResult = await pool.query(scoreDistributionQuery, [datasetId]);

    // Get equity ratio distribution
    const equityDistributionQuery = `
      SELECT 
        CASE 
          WHEN equity_ratio >= 10 THEN '10+'
          WHEN equity_ratio >= 5 THEN '5-9.9'
          WHEN equity_ratio >= 3 THEN '3-4.9'
          WHEN equity_ratio >= 2 THEN '2-2.9'
          WHEN equity_ratio >= 1 THEN '1-1.9'
          ELSE '0-0.9'
        END as equity_range,
        COUNT(*) as count
      FROM properties 
      WHERE dataset_id = $1
      GROUP BY 
        CASE 
          WHEN equity_ratio >= 10 THEN '10+'
          WHEN equity_ratio >= 5 THEN '5-9.9'
          WHEN equity_ratio >= 3 THEN '3-4.9'
          WHEN equity_ratio >= 2 THEN '2-2.9'
          WHEN equity_ratio >= 1 THEN '1-1.9'
          ELSE '0-0.9'
        END
      ORDER BY equity_range DESC
    `;

    const equityDistributionResult = await pool.query(equityDistributionQuery, [datasetId]);

    // Get top opportunities
    const topOpportunitiesQuery = `
      SELECT 
        id, parcel_id, investment_score, equity_ratio, 
        delinquent_amount, property_type, location
      FROM properties 
      WHERE dataset_id = $1
      ORDER BY investment_score DESC
      LIMIT 10
    `;

    const topOpportunitiesResult = await pool.query(topOpportunitiesQuery, [datasetId]);

    res.json({
      stats: {
        totalProperties: parseInt(stats.total_properties),
        averageScore: parseFloat(stats.avg_score || 0),
        averageEquityRatio: parseFloat(stats.avg_equity_ratio || 0),
        totalDelinquent: parseFloat(stats.total_delinquent || 0),
        totalPropertyValue: parseFloat(stats.total_property_value || 0),
        averageDelinquencyAge: parseFloat(stats.avg_delinquency_age || 0),
        scoreDistribution: {
          high: parseInt(stats.high_score_count),
          medium: parseInt(stats.medium_score_count),
          low: parseInt(stats.low_score_count)
        }
      },
      propertyTypes: typeResult.rows,
      scoreDistribution: scoreDistributionResult.rows,
      equityDistribution: equityDistributionResult.rows,
      topOpportunities: topOpportunitiesResult.rows
    });

  } catch (error) {
    console.error('Portfolio analytics error:', error);
    res.status(500).json({ error: 'Failed to get portfolio analytics' });
  }
});

// Get investment score trends
router.get('/trends/:datasetId', authenticateToken, async (req, res) => {
  try {
    const { datasetId } = req.params;
    const userId = req.user.id;

    // Verify dataset ownership
    const datasetCheck = await pool.query(
      'SELECT id FROM property_datasets WHERE id = $1 AND user_id = $2',
      [datasetId, userId]
    );

    if (datasetCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Get score vs equity ratio scatter data
    const scatterQuery = `
      SELECT 
        equity_ratio,
        investment_score,
        delinquent_amount,
        property_type
      FROM properties 
      WHERE dataset_id = $1
      ORDER BY investment_score DESC
    `;

    const scatterResult = await pool.query(scatterQuery, [datasetId]);

    // Get amount distribution
    const amountDistributionQuery = `
      SELECT 
        CASE 
          WHEN delinquent_amount >= 100000 THEN '100k+'
          WHEN delinquent_amount >= 50000 THEN '50k-99k'
          WHEN delinquent_amount >= 25000 THEN '25k-49k'
          WHEN delinquent_amount >= 10000 THEN '10k-24k'
          WHEN delinquent_amount >= 5000 THEN '5k-9k'
          ELSE '0-4k'
        END as amount_range,
        COUNT(*) as count,
        AVG(investment_score) as avg_score
      FROM properties 
      WHERE dataset_id = $1
      GROUP BY 
        CASE 
          WHEN delinquent_amount >= 100000 THEN '100k+'
          WHEN delinquent_amount >= 50000 THEN '50k-99k'
          WHEN delinquent_amount >= 25000 THEN '25k-49k'
          WHEN delinquent_amount >= 10000 THEN '10k-24k'
          WHEN delinquent_amount >= 5000 THEN '5k-9k'
          ELSE '0-4k'
        END
      ORDER BY amount_range DESC
    `;

    const amountDistributionResult = await pool.query(amountDistributionQuery, [datasetId]);

    res.json({
      scatterData: scatterResult.rows,
      amountDistribution: amountDistributionResult.rows
    });

  } catch (error) {
    console.error('Trends analysis error:', error);
    res.status(500).json({ error: 'Failed to get trends analysis' });
  }
});

// Get location-based analytics
router.get('/location/:datasetId', authenticateToken, async (req, res) => {
  try {
    const { datasetId } = req.params;
    const userId = req.user.id;

    // Verify dataset ownership
    const datasetCheck = await pool.query(
      'SELECT id FROM property_datasets WHERE id = $1 AND user_id = $2',
      [datasetId, userId]
    );

    if (datasetCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Get location statistics
    const locationQuery = `
      SELECT 
        location,
        COUNT(*) as property_count,
        AVG(investment_score) as avg_score,
        AVG(equity_ratio) as avg_equity_ratio,
        SUM(delinquent_amount) as total_delinquent,
        COUNT(CASE WHEN investment_score >= 70 THEN 1 END) as high_score_count
      FROM properties 
      WHERE dataset_id = $1 AND location IS NOT NULL AND location != ''
      GROUP BY location
      ORDER BY avg_score DESC
    `;

    const locationResult = await pool.query(locationQuery, [datasetId]);

    res.json({
      locations: locationResult.rows
    });

  } catch (error) {
    console.error('Location analytics error:', error);
    res.status(500).json({ error: 'Failed to get location analytics' });
  }
});

// Get risk analysis
router.get('/risk/:datasetId', authenticateToken, async (req, res) => {
  try {
    const { datasetId } = req.params;
    const userId = req.user.id;

    // Verify dataset ownership
    const datasetCheck = await pool.query(
      'SELECT id FROM property_datasets WHERE id = $1 AND user_id = $2',
      [datasetId, userId]
    );

    if (datasetCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Get risk distribution
    const riskQuery = `
      SELECT 
        CASE 
          WHEN investment_score >= 80 THEN 'Low Risk'
          WHEN investment_score >= 60 THEN 'Medium Risk'
          ELSE 'High Risk'
        END as risk_level,
        COUNT(*) as count,
        AVG(equity_ratio) as avg_equity_ratio,
        AVG(delinquency_age) as avg_delinquency_age
      FROM properties 
      WHERE dataset_id = $1
      GROUP BY 
        CASE 
          WHEN investment_score >= 80 THEN 'Low Risk'
          WHEN investment_score >= 60 THEN 'Medium Risk'
          ELSE 'High Risk'
        END
      ORDER BY 
        CASE 
          WHEN investment_score >= 80 THEN 1
          WHEN investment_score >= 60 THEN 2
          ELSE 3
        END
    `;

    const riskResult = await pool.query(riskQuery, [datasetId]);

    // Get properties approaching sale date
    const approachingSaleQuery = `
      SELECT 
        parcel_id,
        power_to_sale_date,
        investment_score,
        delinquent_amount,
        property_type,
        location
      FROM properties 
      WHERE dataset_id = $1 
        AND power_to_sale_date IS NOT NULL
        AND power_to_sale_date <= CURRENT_DATE + INTERVAL '30 days'
      ORDER BY power_to_sale_date ASC
    `;

    const approachingSaleResult = await pool.query(approachingSaleQuery, [datasetId]);

    res.json({
      riskDistribution: riskResult.rows,
      approachingSale: approachingSaleResult.rows
    });

  } catch (error) {
    console.error('Risk analysis error:', error);
    res.status(500).json({ error: 'Failed to get risk analysis' });
  }
});

module.exports = router;
