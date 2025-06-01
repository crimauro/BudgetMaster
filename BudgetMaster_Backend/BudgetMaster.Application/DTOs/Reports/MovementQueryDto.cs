using System.ComponentModel.DataAnnotations;

namespace BudgetMaster.Application.DTOs.Reports
{
    public class MovementQueryDto
    {
        [Required(ErrorMessage = "La fecha de inicio es requerida")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "La fecha de fin es requerida")]
        public DateTime EndDate { get; set; }

        public int? MonetaryFundId { get; set; }
        public int? ExpenseTypeId { get; set; }
    }
}
