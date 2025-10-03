// Demo data for when backend is not available
export const DEMO_PROPERTIES = [
  {
    id: 1,
    address: "123 Main St, Anytown, CA 90210",
    propertyType: "Single Family",
    assessedValue: 450000,
    taxOwed: 12500,
    delinquencyAge: 2,
    equityRatio: 0.72,
    investmentScore: 85,
    estimatedRedemption: 18750,
    lastSaleDate: "2018-03-15",
    lastSalePrice: 380000,
    lotSize: 0.25,
    yearBuilt: 1995,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1850,
    status: "Active",
    watchlisted: false
  },
  {
    id: 2,
    address: "456 Oak Ave, Anytown, CA 90210",
    propertyType: "Condo",
    assessedValue: 280000,
    taxOwed: 8500,
    delinquencyAge: 1,
    equityRatio: 0.65,
    investmentScore: 78,
    estimatedRedemption: 12750,
    lastSaleDate: "2019-07-22",
    lastSalePrice: 295000,
    lotSize: 0.1,
    yearBuilt: 2010,
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1200,
    status: "Active",
    watchlisted: true
  },
  {
    id: 3,
    address: "789 Pine St, Anytown, CA 90210",
    propertyType: "Single Family",
    assessedValue: 320000,
    taxOwed: 15200,
    delinquencyAge: 3,
    equityRatio: 0.58,
    investmentScore: 92,
    estimatedRedemption: 22800,
    lastSaleDate: "2017-11-08",
    lastSalePrice: 340000,
    lotSize: 0.3,
    yearBuilt: 1988,
    bedrooms: 4,
    bathrooms: 3,
    squareFootage: 2200,
    status: "Active",
    watchlisted: false
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
    name: "Los Angeles County Tax Delinquencies",
    uploadDate: "2024-01-15",
    propertyCount: 1250,
    totalValue: 45000000,
    status: "processed"
  },
  {
    id: 2,
    name: "Orange County Tax Delinquencies",
    uploadDate: "2024-01-10",
    propertyCount: 890,
    totalValue: 32000000,
    status: "processed"
  }
];
