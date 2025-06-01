namespace BudgetMaster.Application.DTOs.Reports
{
    public class MovementQueryReportDto
    {
        public MovementQueryFilterDto Filter { get; set; } = new MovementQueryFilterDto();
        public DateTime GeneratedAt { get; set; }
        public decimal TotalDeposits { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetAmount { get; set; }
        public int MovementCount { get; set; }
        public List<MovementItemDto> Movements { get; set; } = new List<MovementItemDto>();
    }

    public class MovementQueryFilterDto
    {
        public int? MonetaryFundId { get; set; }
        public int? ExpenseTypeId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
    }

    public class MovementItemDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty; // "Depósito" o "Gasto"
        public DateTime Date { get; set; }
        public decimal Amount { get; set; } // Positivo para depósitos, negativo para gastos
        public string Description { get; set; } = string.Empty;
        public int MonetaryFundId { get; set; }
        public string MonetaryFundName { get; set; } = string.Empty;
        public int? ExpenseTypeId { get; set; }
        public string? ExpenseTypeName { get; set; }
    }
}
