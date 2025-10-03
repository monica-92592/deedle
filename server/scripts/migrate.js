const pool = require('../config/database');

const createTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Counties table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS counties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        state VARCHAR(2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Property datasets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_datasets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        county_id INTEGER REFERENCES counties(id),
        filename VARCHAR(255) NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_properties INTEGER DEFAULT 0,
        processed_properties INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'uploaded',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Properties table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        dataset_id INTEGER REFERENCES property_datasets(id) ON DELETE CASCADE,
        parcel_id VARCHAR(255),
        power_to_sale_date DATE,
        tax_area VARCHAR(255),
        location VARCHAR(255),
        delinquent_amount DECIMAL(15,2),
        land_value DECIMAL(15,2),
        improvement_value DECIMAL(15,2),
        property_description TEXT,
        address TEXT,
        property_type VARCHAR(100),
        acreage DECIMAL(10,2),
        equity_ratio DECIMAL(10,2),
        delinquency_age INTEGER,
        investment_score INTEGER,
        estimated_redemption DECIMAL(15,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User watchlists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS watchlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        notes TEXT,
        priority VARCHAR(20) DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, property_id)
      )
    `);

    // Analysis cache
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analysis_cache (
        id SERIAL PRIMARY KEY,
        dataset_id INTEGER REFERENCES property_datasets(id) ON DELETE CASCADE,
        analysis_type VARCHAR(100),
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_properties_dataset_id ON properties(dataset_id);
      CREATE INDEX IF NOT EXISTS idx_properties_investment_score ON properties(investment_score);
      CREATE INDEX IF NOT EXISTS idx_properties_equity_ratio ON properties(equity_ratio);
      CREATE INDEX IF NOT EXISTS idx_properties_delinquent_amount ON properties(delinquent_amount);
      CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Run migrations
createTables()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
