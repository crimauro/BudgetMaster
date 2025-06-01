using System.ComponentModel.DataAnnotations;

namespace BudgetMaster.Application.DTOs.ExpenseRecords
{
    public class UpdateExpenseRecordDto
    {
        [Required(ErrorMessage = "El ID del tipo de gasto es obligatorio")]
        public int ExpenseTypeId { get; set; }

        [Required(ErrorMessage = "El ID del fondo monetario es obligatorio")]
        public int MonetaryFundId { get; set; }

        [Required(ErrorMessage = "El monto es obligatorio")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor a cero")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "La fecha es obligatoria")]
        public DateTime Date { get; set; }

        [Required(ErrorMessage = "La descripción es obligatoria")]
        [StringLength(500, MinimumLength = 5, ErrorMessage = "La descripción debe tener entre 5 y 500 caracteres")]
        public string Description { get; set; } = string.Empty;
    }
}
