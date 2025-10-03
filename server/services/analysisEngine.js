class PropertyAnalysisEngine {
  constructor() {
    this.scoringWeights = {
      equityRatio: 0.3,
      delinquencyAge: 0.2,
      propertyType: 0.15,
      locationQuality: 0.15,
      acreage: 0.1,
      competition: 0.1
    };
  }

  // Main analysis function
  analyzeProperty(property) {
    const analysis = {
      equityRatio: this.calculateEquityRatio(property),
      delinquencyAge: this.calculateDelinquencyAge(property),
      propertyType: this.classifyPropertyType(property),
      locationQuality: this.assessLocationQuality(property),
      acreage: this.extractAcreage(property),
      investmentScore: 0,
      estimatedRedemption: this.calculateEstimatedRedemption(property),
      riskLevel: 'medium',
      recommendations: []
    };

    // Calculate investment score
    analysis.investmentScore = this.calculateInvestmentScore(analysis);
    
    // Determine risk level
    analysis.riskLevel = this.assessRiskLevel(analysis);
    
    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis, property);

    return analysis;
  }

  // Calculate equity ratio: (Land Value + Improvement Value) / Delinquent Amount
  calculateEquityRatio(property) {
    const landValue = property.landValue || 0;
    const improvementValue = property.improvementValue || 0;
    const totalValue = landValue + improvementValue;
    const delinquentAmount = property.delinquentAmount || 0;

    if (delinquentAmount === 0) return 0;
    return totalValue / delinquentAmount;
  }

  // Calculate days since power to sale date
  calculateDelinquencyAge(property) {
    if (!property.powerToSaleDate) return 0;
    
    const saleDate = new Date(property.powerToSaleDate);
    const today = new Date();
    const diffTime = today - saleDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Classify property type based on description
  classifyPropertyType(property) {
    const description = (property.propertyDescription || '').toLowerCase();
    const address = (property.address || '').toLowerCase();
    const location = (property.location || '').toLowerCase();
    
    // Commercial indicators
    if (description.includes('commercial') || 
        description.includes('retail') || 
        description.includes('office') ||
        description.includes('warehouse') ||
        description.includes('industrial')) {
      return 'commercial';
    }
    
    // Residential indicators
    if (description.includes('residential') || 
        description.includes('single family') ||
        description.includes('house') ||
        description.includes('home') ||
        description.includes('dwelling')) {
      return 'residential';
    }
    
    // Raw land indicators
    if (description.includes('vacant') || 
        description.includes('raw land') ||
        description.includes('undeveloped') ||
        description.includes('lot') ||
        (!description.includes('building') && !description.includes('structure'))) {
      return 'raw_land';
    }
    
    // Multi-family indicators
    if (description.includes('apartment') || 
        description.includes('multi-family') ||
        description.includes('duplex') ||
        description.includes('condo')) {
      return 'multi_family';
    }
    
    return 'unknown';
  }

  // Assess location quality
  assessLocationQuality(property) {
    const location = (property.location || '').toLowerCase();
    const address = (property.address || '').toLowerCase();
    
    // High-quality location indicators
    if (location.includes('city') || 
        location.includes('downtown') ||
        location.includes('metro') ||
        address.includes('main st') ||
        address.includes('downtown')) {
      return 'high';
    }
    
    // Medium-quality indicators
    if (location.includes('suburb') || 
        location.includes('town') ||
        location.includes('village')) {
      return 'medium';
    }
    
    // Rural/remote indicators
    if (location.includes('rural') || 
        location.includes('county') ||
        location.includes('unincorporated')) {
      return 'low';
    }
    
    return 'unknown';
  }

  // Extract acreage from property description
  extractAcreage(property) {
    const description = (property.propertyDescription || '').toLowerCase();
    
    // Look for acreage patterns
    const acreagePatterns = [
      /(\d+\.?\d*)\s*acres?/,
      /(\d+\.?\d*)\s*ac/,
      /(\d+\.?\d*)\s*a\./
    ];
    
    for (const pattern of acreagePatterns) {
      const match = description.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }
    
    return null;
  }

  // Calculate estimated redemption amount
  calculateEstimatedRedemption(property) {
    const baseAmount = property.delinquentAmount || 0;
    const ageInYears = this.calculateDelinquencyAge(property) / 365;
    
    // Estimate interest and fees (varies by jurisdiction)
    const interestRate = 0.12; // 12% annual interest (typical for tax liens)
    const additionalFees = 100; // Estimated fees
    
    const interest = baseAmount * interestRate * ageInYears;
    return baseAmount + interest + additionalFees;
  }

  // Calculate investment score (0-100)
  calculateInvestmentScore(analysis) {
    let score = 0;
    
    // Equity ratio scoring (0-30 points)
    if (analysis.equityRatio >= 5) score += 30;
    else if (analysis.equityRatio >= 3) score += 20;
    else if (analysis.equityRatio >= 2) score += 10;
    
    // Delinquency age scoring (0-20 points)
    const ageInYears = analysis.delinquencyAge / 365;
    if (ageInYears >= 1 && ageInYears <= 3) score += 20;
    else if (ageInYears >= 0.5 && ageInYears <= 5) score += 15;
    else if (ageInYears >= 0.25) score += 10;
    
    // Property type scoring (0-15 points)
    switch (analysis.propertyType) {
      case 'residential': score += 15; break;
      case 'commercial': score += 12; break;
      case 'multi_family': score += 10; break;
      case 'raw_land': score += 5; break;
      default: score += 3;
    }
    
    // Location quality scoring (0-15 points)
    switch (analysis.locationQuality) {
      case 'high': score += 15; break;
      case 'medium': score += 10; break;
      case 'low': score += 5; break;
      default: score += 3;
    }
    
    // Acreage scoring (0-10 points)
    if (analysis.acreage && analysis.acreage >= 5) score += 10;
    else if (analysis.acreage && analysis.acreage >= 1) score += 5;
    
    // Competition scoring (0-10 points) - based on amount
    const amount = analysis.equityRatio * (property.delinquentAmount || 0);
    if (amount < 10000) score += 10; // Low competition
    else if (amount < 50000) score += 5; // Medium competition
    
    return Math.min(Math.max(score, 0), 100);
  }

  // Assess risk level
  assessRiskLevel(analysis) {
    if (analysis.investmentScore >= 80) return 'low';
    if (analysis.investmentScore >= 60) return 'medium';
    return 'high';
  }

  // Generate investment recommendations
  generateRecommendations(analysis, property) {
    const recommendations = [];
    
    // High equity ratio recommendations
    if (analysis.equityRatio >= 5) {
      recommendations.push({
        type: 'positive',
        message: 'Excellent equity ratio - strong potential for profit',
        priority: 'high'
      });
    }
    
    // Delinquency age recommendations
    if (analysis.delinquencyAge > 1095) { // 3+ years
      recommendations.push({
        type: 'warning',
        message: 'Property has been delinquent for 3+ years - investigate why',
        priority: 'high'
      });
    }
    
    // Property type recommendations
    if (analysis.propertyType === 'raw_land') {
      recommendations.push({
        type: 'info',
        message: 'Raw land investment - consider development potential',
        priority: 'medium'
      });
    }
    
    // Location recommendations
    if (analysis.locationQuality === 'high') {
      recommendations.push({
        type: 'positive',
        message: 'Prime location - high demand area',
        priority: 'high'
      });
    }
    
    // Investment strategy recommendations
    if (analysis.investmentScore >= 70) {
      recommendations.push({
        type: 'action',
        message: 'Consider pre-sale contact with property owner',
        priority: 'high'
      });
    } else if (analysis.investmentScore >= 50) {
      recommendations.push({
        type: 'action',
        message: 'Monitor for auction date and prepare to bid',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  // Batch analyze multiple properties
  analyzeProperties(properties) {
    return properties.map(property => {
      const analysis = this.analyzeProperty(property);
      return {
        ...property,
        ...analysis
      };
    });
  }

  // Generate portfolio statistics
  generatePortfolioStats(analyzedProperties) {
    const stats = {
      totalProperties: analyzedProperties.length,
      averageScore: 0,
      scoreDistribution: { high: 0, medium: 0, low: 0 },
      propertyTypes: {},
      totalValue: 0,
      totalDelinquent: 0,
      averageEquityRatio: 0,
      topOpportunities: []
    };

    if (analyzedProperties.length === 0) return stats;

    let totalScore = 0;
    let totalEquityRatio = 0;

    analyzedProperties.forEach(property => {
      totalScore += property.investmentScore || 0;
      totalEquityRatio += property.equityRatio || 0;
      
      stats.totalValue += (property.landValue || 0) + (property.improvementValue || 0);
      stats.totalDelinquent += property.delinquentAmount || 0;
      
      // Score distribution
      if (property.investmentScore >= 70) stats.scoreDistribution.high++;
      else if (property.investmentScore >= 50) stats.scoreDistribution.medium++;
      else stats.scoreDistribution.low++;
      
      // Property types
      const type = property.propertyType || 'unknown';
      stats.propertyTypes[type] = (stats.propertyTypes[type] || 0) + 1;
    });

    stats.averageScore = totalScore / analyzedProperties.length;
    stats.averageEquityRatio = totalEquityRatio / analyzedProperties.length;
    
    // Top opportunities (top 10 by score)
    stats.topOpportunities = analyzedProperties
      .sort((a, b) => (b.investmentScore || 0) - (a.investmentScore || 0))
      .slice(0, 10)
      .map(property => ({
        parcelId: property.parcelId,
        investmentScore: property.investmentScore,
        equityRatio: property.equityRatio,
        delinquentAmount: property.delinquentAmount
      }));

    return stats;
  }
}

module.exports = PropertyAnalysisEngine;
