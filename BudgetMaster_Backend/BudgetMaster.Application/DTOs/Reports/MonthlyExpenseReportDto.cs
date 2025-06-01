namespace BudgetMaster.Application.DTOs.Reports
{
    public class MonthlyExpenseReportDto
    {
        public int Year { get; set; }
        public DateTime GeneratedAt { get; set; }
        public decimal TotalYearExpenses { get; set; }
        public decimal TotalYearDeposits { get; set; }
        public decimal NetYearAmount { get; set; }
        public decimal AverageMonthlyExpenses { get; set; }
        public List<MonthlyExpenseDataDto> MonthlyData { get; set; } = new List<MonthlyExpenseDataDto>();
    }

    public class MonthlyExpenseDataDto
    {
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal TotalExpenses { get; set; }
        public decimal TotalDeposits { get; set; }
        public decimal NetAmount { get; set; }
        public int ExpenseCount { get; set; }
        public int DepositCount { get; set; }
    }
}
