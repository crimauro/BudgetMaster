using System.ComponentModel.DataAnnotations;

namespace BudgetMaster.Domain.Entities
{    public class Deposit : BaseEntity
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int MonetaryFundId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual MonetaryFund MonetaryFund { get; set; } = null!;
    }
}
