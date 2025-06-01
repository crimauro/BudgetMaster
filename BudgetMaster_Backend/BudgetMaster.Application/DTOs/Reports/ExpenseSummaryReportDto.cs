namespace BudgetMaster.Application.DTOs.Reports
{
    public class ExpenseSummaryReportDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal TotalDeposits { get; set; }
        public decimal NetMovement { get; set; }
        public List<ExpensesByTypeReportDto> ExpensesByType { get; set; } = new();
        public List<MonetaryFundBalanceReportDto> FundBalances { get; set; } = new();
    }
}
