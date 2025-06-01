namespace BudgetMaster.Application.DTOs.Reports
{
    public class BudgetComparisonDto
    {
        public string ExpenseTypeName { get; set; } = string.Empty;
        public string ExpenseTypeCode { get; set; } = string.Empty;
        public decimal BudgetedAmount { get; set; }
        public decimal ExecutedAmount { get; set; }
        public decimal Variance { get; set; }
        public decimal VariancePercentage { get; set; }
        public bool IsOverBudget { get; set; }
    }
}
