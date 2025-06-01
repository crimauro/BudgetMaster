namespace BudgetMaster.Application.DTOs.Reports
{
    public class BudgetVsExecutionReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime GeneratedAt { get; set; }
        public decimal TotalBudgeted { get; set; }
        public decimal TotalExecuted { get; set; }
        public decimal TotalRemaining { get; set; }
        public decimal OverallExecutionPercentage { get; set; }
        public List<BudgetVsExecutionItemDto> Items { get; set; } = new List<BudgetVsExecutionItemDto>();
    }

    public class BudgetVsExecutionItemDto
    {
        public int BudgetId { get; set; }
        public int ExpenseTypeId { get; set; }
        public string ExpenseTypeName { get; set; } = string.Empty;
        public decimal BudgetAmount { get; set; }
        public decimal ExecutedAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public decimal ExecutionPercentage { get; set; }
        public DateTime BudgetStartDate { get; set; }
        public DateTime BudgetEndDate { get; set; }
    }
}
