namespace BudgetMaster.Application.DTOs.Reports
{
    public class MonthlyFinancialSummaryDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int Month { get; set; }
        public int Year { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal TotalBudgeted { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal TotalDeposited { get; set; }
        public decimal BudgetVariance { get; set; }
        public decimal BudgetUtilizationPercentage { get; set; }
        public List<BudgetComparisonDto> BudgetDetails { get; set; } = new();
        public List<MonetaryFundBalanceReportDto> FundBalances { get; set; } = new();
    }
}
