using System.ComponentModel.DataAnnotations;

namespace BudgetMaster.Application.DTOs.ExpenseTypes
{
    public class UpdateExpenseTypeDto
    {
        [Required(ErrorMessage = "El ID es requerido")]
        public int Id { get; set; }

        [Required(ErrorMessage = "El código es requerido")]
        [MaxLength(10, ErrorMessage = "El código no puede exceder 10 caracteres")]
        public string Code { get; set; } = string.Empty;

        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
        public string? Description { get; set; }
    }
}
