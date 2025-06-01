using System.ComponentModel.DataAnnotations;

namespace BudgetMaster.Application.DTOs.ExpenseTypes
{
    public class CreateExpenseTypeDto
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
        public string? Description { get; set; }
    }
}
