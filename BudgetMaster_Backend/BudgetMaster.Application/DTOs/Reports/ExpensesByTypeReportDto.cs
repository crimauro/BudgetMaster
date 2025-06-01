namespace BudgetMaster.Application.DTOs.Reports
{
    public class ExpensesByTypeReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime GeneratedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public List<ExpensesByTypeItemDto> Items { get; set; } = new List<ExpensesByTypeItemDto>();
    }

    public class ExpensesByTypeItemDto
    {
        public int ExpenseTypeId { get; set; }
        public string ExpenseTypeName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public int TransactionCount { get; set; }
        public decimal AverageAmount { get; set; }
        public decimal Percentage { get; set; }
    }
}
