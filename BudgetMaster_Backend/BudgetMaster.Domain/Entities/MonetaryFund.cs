using System.ComponentModel.DataAnnotations;

namespace BudgetMaster.Domain.Entities
{    public class MonetaryFund : BaseEntity
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public decimal Balance { get; set; }

        [Required]
        public decimal InitialBalance { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual ICollection<ExpenseRecord> ExpenseRecords { get; set; } = new List<ExpenseRecord>();
        public virtual ICollection<Deposit> Deposits { get; set; } = new List<Deposit>();
    }
}
