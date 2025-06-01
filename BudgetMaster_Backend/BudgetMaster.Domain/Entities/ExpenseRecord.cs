using System.ComponentModel.DataAnnotations;
using BudgetMaster.Domain.Enums;

namespace BudgetMaster.Domain.Entities
{    public class ExpenseRecord : BaseEntity
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int MonetaryFundId { get; set; }

        [Required]
        public int ExpenseTypeId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(500)]
        public string? Observations { get; set; }

        [MaxLength(200)]
        public string? StoreName { get; set; }

        [Required]
        public DocumentType DocumentType { get; set; }

        public decimal TotalAmount { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual MonetaryFund MonetaryFund { get; set; } = null!;
        public virtual ExpenseType ExpenseType { get; set; } = null!;
        public virtual ICollection<ExpenseDetail> ExpenseDetails { get; set; } = new List<ExpenseDetail>();
    }
}
