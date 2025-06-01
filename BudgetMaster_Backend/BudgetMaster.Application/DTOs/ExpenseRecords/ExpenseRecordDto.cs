using BudgetMaster.Domain.Enums;

namespace BudgetMaster.Application.DTOs.ExpenseRecords
{
    public class ExpenseRecordDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public int MonetaryFundId { get; set; }
        public string MonetaryFundName { get; set; } = string.Empty;
        public string? Observations { get; set; }
        public string? StoreName { get; set; }
        public DocumentType DocumentType { get; set; }
        public string DocumentTypeName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsActive { get; set; }
        public List<ExpenseDetailDto> ExpenseDetails { get; set; } = new List<ExpenseDetailDto>();
    }
}
