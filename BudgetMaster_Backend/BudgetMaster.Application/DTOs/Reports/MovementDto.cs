namespace BudgetMaster.Application.DTOs.Reports
{
    public class MovementDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty; // "Expense" or "Deposit"
        public string MonetaryFundName { get; set; } = string.Empty;
        public string? ExpenseTypeName { get; set; }
        public string? ExpenseTypeCode { get; set; }
        public string UserName { get; set; } = string.Empty;
    }
}
