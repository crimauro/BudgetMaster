using System.ComponentModel.DataAnnotations;

namespace BudgetMaster.Application.DTOs.MonetaryFunds
{
    public class UpdateMonetaryFundDto
    {
        [Required(ErrorMessage = "El ID es requerido")]
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "El balance es requerido")]
        [Range(0, double.MaxValue, ErrorMessage = "El balance debe ser mayor o igual a 0")]
        public decimal Balance { get; set; }
    }
}
