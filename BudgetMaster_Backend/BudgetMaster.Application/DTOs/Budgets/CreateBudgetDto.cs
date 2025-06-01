using System.ComponentModel.DataAnnotations;

namespace BudgetMaster.Application.DTOs.Budgets
{
    public class CreateBudgetDto
    {
        [Required(ErrorMessage = "El ID de usuario es requerido")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "El tipo de gasto es requerido")]
        public int ExpenseTypeId { get; set; }

        [Required(ErrorMessage = "El mes es requerido")]
        [Range(1, 12, ErrorMessage = "El mes debe estar entre 1 y 12")]
        public int Month { get; set; }        [Required(ErrorMessage = "El año es requerido")]
        [Range(2020, 2050, ErrorMessage = "El año debe estar entre 2020 y 2050")]
        public int Year { get; set; }

        [Required(ErrorMessage = "El monto es requerido")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor a 0")]
        public decimal Amount { get; set; }

        [MaxLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "La fecha de inicio es requerida")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "La fecha de fin es requerida")]
        public DateTime EndDate { get; set; }
    }
}
