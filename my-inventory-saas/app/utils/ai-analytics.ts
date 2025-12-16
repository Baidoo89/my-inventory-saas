// Simple Linear Regression and Analytics Utility for StockFlow AI

// 1. Linear Regression for Sales Forecasting
// Equation: y = mx + b
// m = slope (trend)
// b = intercept (starting point)

export type DataPoint = {
    date: string;
    value: number;
};

export type ForecastResult = {
    historical: DataPoint[];
    forecast: DataPoint[];
    trend: 'up' | 'down' | 'stable';
    confidence: number; // Simple R-squared approximation
};

export const generateSalesForecast = (salesHistory: any[], daysToForecast: number = 7): ForecastResult => {
    // 1. Group sales by date
    const salesByDate = new Map<string, number>();
    
    salesHistory.forEach(sale => {
        const date = new Date(sale.sale_date).toLocaleDateString();
        const current = salesByDate.get(date) || 0;
        salesByDate.set(date, current + sale.total_price);
    });

    // Convert to array and sort
    const sortedData = Array.from(salesByDate.entries())
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // If not enough data, return empty
    if (sortedData.length < 2) {
        return { historical: sortedData, forecast: [], trend: 'stable', confidence: 0 };
    }

    // 2. Prepare data for regression (x = day index, y = sales amount)
    const n = sortedData.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    const historicalPoints = sortedData.map((point, index) => {
        const x = index;
        const y = point.value;
        
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;

        return { ...point, x };
    });

    // 3. Calculate Slope (m) and Intercept (b)
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 4. Generate Forecast
    const forecast: DataPoint[] = [];
    const lastDate = new Date(sortedData[sortedData.length - 1].date);

    for (let i = 1; i <= daysToForecast; i++) {
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + i);
        
        const nextX = n - 1 + i; // Continue the x-axis sequence
        let predictedY = slope * nextX + intercept;
        
        // Prevent negative sales prediction
        if (predictedY < 0) predictedY = 0;

        forecast.push({
            date: nextDate.toLocaleDateString(),
            value: Math.round(predictedY * 100) / 100
        });
    }

    return {
        historical: sortedData,
        forecast,
        trend: slope > 0.5 ? 'up' : slope < -0.5 ? 'down' : 'stable',
        confidence: 0.85 // Placeholder for demo
    };
};

// 2. Smart Restock Recommendations (Velocity Analysis)
export const analyzeStockVelocity = (products: any[], sales: any[]) => {
    const recommendations: any[] = [];

    products.forEach(product => {
        // Filter sales for this product
        const productSales = sales.filter(s => s.product_name === product.name); // Using name as loose link if ID missing
        
        if (productSales.length === 0) return;

        // Calculate Sales Velocity (Items sold per day)
        // We look at the first sale date vs now to get the time range
        const firstSale = new Date(productSales[productSales.length - 1].sale_date);
        const now = new Date();
        const daysDiff = Math.max(1, Math.ceil((now.getTime() - firstSale.getTime()) / (1000 * 3600 * 24)));
        
        const totalSold = productSales.reduce((sum: number, s: any) => sum + s.quantity, 0);
        const velocity = totalSold / daysDiff; // Items per day

        // Estimate Days Until Stockout
        const daysUntilStockout = velocity > 0 ? product.stock_quantity / velocity : 999;

        // Logic: If stock will run out in less than 7 days, recommend restock
        if (daysUntilStockout < 14) { // 2 week buffer
            recommendations.push({
                id: product.id,
                name: product.name,
                currentStock: product.stock_quantity,
                velocity: velocity.toFixed(2),
                daysLeft: Math.round(daysUntilStockout),
                suggestedRestock: Math.ceil(velocity * 30) // Suggest buying 30 days worth
            });
        }
    });

    return recommendations.sort((a, b) => a.daysLeft - b.daysLeft);
};
