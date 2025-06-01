namespace BudgetMaster.Application.DTOs.Deposits
{
    public class DepositDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public int MonetaryFundId { get; set; }
        public string MonetaryFundName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsActive { get; set; }
    }
}
