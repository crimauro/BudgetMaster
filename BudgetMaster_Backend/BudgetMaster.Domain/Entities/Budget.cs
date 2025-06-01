using System.ComponentModel.DataAnnotations;

namespace BudgetMaster.Domain.Entities
{
    public class Budget : BaseEntity
    {
        [Required]
        public int UserId { get; set; }        [Required]
        public int ExpenseTypeId { get; set; }

        [Required]
        public int Month { get; set; }

        [Required]
        public int Year { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual ExpenseType ExpenseType { get; set; } = null!;
    }
}
