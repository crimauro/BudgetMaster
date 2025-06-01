using BudgetMaster.Domain.Enums;

namespace BudgetMaster.Application.DTOs.Reports
{
    public class MovementResultDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Type { get; set; } = string.Empty; // "Deposito" o "Gasto"
        public string MonetaryFundName { get; set; } = string.Empty;
        public string? ExpenseTypeName { get; set; }
        public string? StoreName { get; set; }
        public DocumentType? DocumentType { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public string? Observations { get; set; }
    }
}
