using System.ComponentModel.DataAnnotations;

namespace BudgetMaster.Domain.Entities
{
    public class ExpenseDetail : BaseEntity
    {
        [Required]
        public int ExpenseRecordId { get; set; }

        [Required]
        public int ExpenseTypeId { get; set; }

        [Required]
        [MaxLength(200)]
        public string ItemName { get; set; } = string.Empty;

        [Required]
        public decimal Quantity { get; set; }

        [Required]
        public decimal UnitPrice { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [MaxLength(200)]
        public string? Description { get; set; }        // Navigation properties
        public virtual ExpenseRecord ExpenseRecord { get; set; } = null!;
        public virtual ExpenseType ExpenseType { get; set; } = null!;
    }
}
