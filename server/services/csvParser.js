const csv = require('csv-parser');
const { Readable } = require('stream');

class IntelligentCSVParser {
  constructor() {
    this.columnMappings = {
      parcelId: ['parcel', 'parcel_id', 'parcelid', 'parcel number', 'parcel no', 'id'],
      powerToSaleDate: ['power to sale', 'power_to_sale', 'power to sale date', 'sale date', 'tax sale date', 'auction date'],
      taxArea: ['tax area', 'tax_area', 'area', 'district', 'zone'],
      location: ['location', 'city', 'municipality', 'town'],
      delinquentAmount: ['delinquent', 'delinquent amount', 'delinquent_amount', 'owed', 'balance', 'tax owed'],
      landValue: ['land value', 'land_value', 'land', 'land val', 'land worth'],
      improvementValue: ['improvement', 'improvement value', 'improvement_value', 'improvements', 'building value', 'structure value'],
      propertyDescription: ['description', 'property description', 'property_description', 'legal description', 'legal'],
      address: ['address', 'street', 'street address', 'location address']
    };
  }

  // Auto-detect column types based on headers and sample data
  detectColumnType(header, sampleData) {
    const headerLower = header.toLowerCase().trim();
    
    // Check for exact matches first
    for (const [type, patterns] of Object.entries(this.columnMappings)) {
      if (patterns.some(pattern => headerLower.includes(pattern))) {
        return type;
      }
    }

    // Pattern-based detection
    if (this.isDateColumn(sampleData)) return 'powerToSaleDate';
    if (this.isMoneyColumn(sampleData)) return 'delinquentAmount';
    if (this.isAddressColumn(sampleData)) return 'address';
    if (this.isDescriptionColumn(sampleData)) return 'propertyDescription';
    
    return 'unknown';
  }

  isDateColumn(sampleData) {
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/
    ];
    
    return sampleData.some(value => 
      value && datePatterns.some(pattern => pattern.test(value.toString()))
    );
  }

  isMoneyColumn(sampleData) {
    const moneyPatterns = [
      /^\$?[\d,]+\.?\d*$/,
      /^\$?[\d,]+$/
    ];
    
    return sampleData.some(value => 
      value && moneyPatterns.some(pattern => pattern.test(value.toString()))
    );
  }

  isAddressColumn(sampleData) {
    const addressPatterns = [
      /\d+\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|blvd|boulevard)/i,
      /^\d+\s+.*\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|blvd|boulevard)/i
    ];
    
    return sampleData.some(value => 
      value && addressPatterns.some(pattern => pattern.test(value.toString()))
    );
  }

  isDescriptionColumn(sampleData) {
    return sampleData.some(value => 
      value && value.toString().length > 50
    );
  }

  // Parse CSV with intelligent column detection
  async parseCSV(csvContent, filename) {
    return new Promise((resolve, reject) => {
      const results = [];
      const columnMapping = {};
      let headers = [];
      let sampleData = [];
      let rowCount = 0;

      const stream = Readable.from([csvContent]);
      
      stream
        .pipe(csv())
        .on('headers', (headerList) => {
          headers = headerList;
          console.log('Detected headers:', headers);
        })
        .on('data', (row) => {
          rowCount++;
          
          // Collect sample data for first 10 rows
          if (rowCount <= 10) {
            sampleData.push(Object.values(row));
          }
          
          // Auto-detect column types after collecting sample data
          if (rowCount === 10) {
            headers.forEach((header, index) => {
              const columnSample = sampleData.map(row => row[index]).filter(val => val);
              columnMapping[header] = this.detectColumnType(header, columnSample);
            });
            console.log('Column mapping:', columnMapping);
          }
          
          // Transform row data based on detected types
          const transformedRow = this.transformRow(row, columnMapping);
          results.push(transformedRow);
        })
        .on('end', () => {
          console.log(`Parsed ${results.length} rows from ${filename}`);
          resolve({
            data: results,
            columnMapping,
            totalRows: results.length,
            filename
          });
        })
        .on('error', (error) => {
          console.error('CSV parsing error:', error);
          reject(error);
        });
    });
  }

  // Transform row data based on detected column types
  transformRow(row, columnMapping) {
    const transformed = {};
    
    Object.entries(row).forEach(([header, value]) => {
      const columnType = columnMapping[header];
      transformed[header] = this.transformValue(value, columnType);
    });
    
    return transformed;
  }

  transformValue(value, columnType) {
    if (!value || value === '') return null;
    
    switch (columnType) {
      case 'powerToSaleDate':
        return this.parseDate(value);
      case 'delinquentAmount':
      case 'landValue':
      case 'improvementValue':
        return this.parseMoney(value);
      case 'parcelId':
        return value.toString().trim();
      default:
        return value.toString().trim();
    }
  }

  parseDate(dateString) {
    if (!dateString) return null;
    
    // Handle various date formats
    const dateFormats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      /^(\d{4})-(\d{2})-(\d{2})$/,
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/
    ];
    
    for (const format of dateFormats) {
      const match = dateString.match(format);
      if (match) {
        if (format === dateFormats[0]) { // MM/DD/YYYY
          return new Date(match[3], match[1] - 1, match[2]);
        } else if (format === dateFormats[1]) { // YYYY-MM-DD
          return new Date(match[1], match[2] - 1, match[3]);
        } else { // MM-DD-YYYY
          return new Date(match[3], match[1] - 1, match[2]);
        }
      }
    }
    
    // Fallback to Date constructor
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  parseMoney(moneyString) {
    if (!moneyString) return null;
    
    // Remove currency symbols and commas, convert to number
    const cleaned = moneyString.toString()
      .replace(/[$,\s]/g, '')
      .replace(/[^\d.-]/g, '');
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  // Validate parsed data quality
  validateData(data) {
    const issues = [];
    const stats = {
      totalRows: data.length,
      validRows: 0,
      missingParcelId: 0,
      missingAmounts: 0,
      invalidDates: 0
    };

    data.forEach((row, index) => {
      let isValid = true;
      
      if (!row.parcelId || row.parcelId === '') {
        stats.missingParcelId++;
        issues.push(`Row ${index + 1}: Missing parcel ID`);
        isValid = false;
      }
      
      if (!row.delinquentAmount || row.delinquentAmount <= 0) {
        stats.missingAmounts++;
        issues.push(`Row ${index + 1}: Missing or invalid delinquent amount`);
        isValid = false;
      }
      
      if (row.powerToSaleDate && isNaN(new Date(row.powerToSaleDate).getTime())) {
        stats.invalidDates++;
        issues.push(`Row ${index + 1}: Invalid date format`);
        isValid = false;
      }
      
      if (isValid) stats.validRows++;
    });

    return {
      stats,
      issues: issues.slice(0, 50), // Limit to first 50 issues
      qualityScore: (stats.validRows / stats.totalRows) * 100
    };
  }
}

module.exports = IntelligentCSVParser;
