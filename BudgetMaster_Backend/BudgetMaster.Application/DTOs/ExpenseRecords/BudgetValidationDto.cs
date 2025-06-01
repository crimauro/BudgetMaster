namespace BudgetMaster.Application.DTOs.ExpenseRecords
{
    public class BudgetValidationDto
    {
        public string ExpenseTypeName { get; set; } = string.Empty;
        public decimal BudgetedAmount { get; set; }
        public decimal SpentAmount { get; set; }
        public decimal NewExpenseAmount { get; set; }
        public decimal OverBudgetAmount { get; set; }
        public bool IsOverBudget { get; set; }
    }
}
