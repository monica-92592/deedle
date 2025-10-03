// Demo data for when backend is not available
export const DEMO_PROPERTIES = [
  {
    id: 1,
    parcelId: "123-456-789",
    powerToSaleDate: "2024-06-15",
    taxArea: "Area 001",
    location: "Anytown, CA",
    delinquentAmount: 12500,
    landValue: 180000,
    improvementValue: 270000,
    propertyDescription: "Single Family Residence",
    address: "123 Main St, Anytown, CA 90210",
    propertyType: "Single Family",
    acreage: 0.25,
    equityRatio: 0.72,
    delinquencyAge: 2,
    investmentScore: 85,
    estimatedRedemption: 18750,
    datasetId: 1,
    datasetName: "Los Angeles County Tax Delinquencies",
    uploadDate: "2024-01-15"
  },
  {
    id: 2,
    parcelId: "456-789-012",
    powerToSaleDate: "2024-05-20",
    taxArea: "Area 002",
    location: "Anytown, CA",
    delinquentAmount: 8500,
    landValue: 120000,
    improvementValue: 160000,
    propertyDescription: "Condominium",
    address: "456 Oak Ave, Anytown, CA 90210",
    propertyType: "Condo",
    acreage: 0.1,
    equityRatio: 0.65,
    delinquencyAge: 1,
    investmentScore: 78,
    estimatedRedemption: 12750,
    datasetId: 1,
    datasetName: "Los Angeles County Tax Delinquencies",
    uploadDate: "2024-01-15"
  },
  {
    id: 3,
    parcelId: "789-012-345",
    powerToSaleDate: "2024-07-10",
    taxArea: "Area 003",
    location: "Anytown, CA",
    delinquentAmount: 15200,
    landValue: 150000,
    improvementValue: 170000,
    propertyDescription: "Single Family Residence",
    address: "789 Pine St, Anytown, CA 90210",
    propertyType: "Single Family",
    acreage: 0.3,
    equityRatio: 0.58,
    delinquencyAge: 3,
    investmentScore: 92,
    estimatedRedemption: 22800,
    datasetId: 1,
    datasetName: "Los Angeles County Tax Delinquencies",
    uploadDate: "2024-01-15"
  }
];

export const DEMO_ANALYTICS = {
  portfolio: {
    totalProperties: 3,
    totalValue: 1050000,
    totalTaxOwed: 36200,
    averageScore: 85,
    highValueCount: 1,
    mediumValueCount: 2,
    lowValueCount: 0
  },
  trends: {
    monthlyData: [
      { month: 'Jan', properties: 12, value: 1200000 },
      { month: 'Feb', properties: 15, value: 1450000 },
      { month: 'Mar', properties: 18, value: 1680000 },
      { month: 'Apr', properties: 22, value: 1920000 },
      { month: 'May', properties: 25, value: 2150000 },
      { month: 'Jun', properties: 28, value: 2380000 }
    ]
  },
  location: {
    byNeighborhood: [
      { name: 'Downtown', count: 8, avgValue: 450000 },
      { name: 'Suburbs', count: 12, avgValue: 320000 },
      { name: 'Rural', count: 5, avgValue: 280000 }
    ]
  },
  risk: {
    highRisk: 2,
    mediumRisk: 1,
    lowRisk: 0,
    riskFactors: [
      { factor: 'High Delinquency Age', count: 1 },
      { factor: 'Low Equity Ratio', count: 1 },
      { factor: 'Property Condition', count: 1 }
    ]
  }
};

export const DEMO_DATASETS = [
  {
    id: 1,
    filename: "los_angeles_county_tax_delinquencies.csv",
    uploadDate: "2024-01-15",
    totalProperties: 1250,
    processedProperties: 1250,
    status: "processed"
  },
  {
    id: 2,
    filename: "orange_county_tax_delinquencies.csv",
    uploadDate: "2024-01-10",
    totalProperties: 890,
    processedProperties: 890,
    status: "processed"
  }
];
