namespace BudgetMaster.Application.DTOs.ExpenseRecords
{
    public class ExpenseDetailDto
    {
        public int Id { get; set; }
        public int ExpenseRecordId { get; set; }
        public int ExpenseTypeId { get; set; }
        public string ExpenseTypeName { get; set; } = string.Empty;
        public string ExpenseTypeCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Description { get; set; }
    }
}
