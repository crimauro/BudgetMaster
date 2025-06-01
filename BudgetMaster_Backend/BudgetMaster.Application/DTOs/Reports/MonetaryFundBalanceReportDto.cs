namespace BudgetMaster.Application.DTOs.Reports
{
    public class MonetaryFundBalanceReportDto
    {
        public DateTime GeneratedAt { get; set; }
        public decimal TotalDeposits { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal TotalBalance { get; set; }
        public List<MonetaryFundBalanceItemDto> FundBalances { get; set; } = new List<MonetaryFundBalanceItemDto>();
    }

    public class MonetaryFundBalanceItemDto
    {
        public int MonetaryFundId { get; set; }
        public string MonetaryFundName { get; set; } = string.Empty;
        public decimal TotalDeposits { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal CurrentBalance { get; set; }
        public int TransactionCount { get; set; }
        public DateTime? LastTransactionDate { get; set; }
    }
}
