using System.ComponentModel.DataAnnotations;
using BudgetMaster.Domain.Enums;

namespace BudgetMaster.Domain.Entities
{
    public class User : BaseEntity
    {
        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(100)]
        public string? FullName { get; set; }

        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        public DocumentType DocumentType { get; set; }        [MaxLength(20)]
        public string DocumentNumber { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<Budget> Budgets { get; set; } = new List<Budget>();
        public virtual ICollection<MonetaryFund> MonetaryFunds { get; set; } = new List<MonetaryFund>();
        public virtual ICollection<ExpenseRecord> ExpenseRecords { get; set; } = new List<ExpenseRecord>();
        public virtual ICollection<Deposit> Deposits { get; set; } = new List<Deposit>();
    }
}
