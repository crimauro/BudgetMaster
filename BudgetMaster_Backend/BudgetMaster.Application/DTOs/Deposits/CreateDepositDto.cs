using System.ComponentModel.DataAnnotations;

namespace BudgetMaster.Application.DTOs.Deposits
{
    public class CreateDepositDto
    {
        [Required(ErrorMessage = "El usuario es requerido")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "La fecha es requerida")]
        public DateTime Date { get; set; }

        [Required(ErrorMessage = "El fondo monetario es requerido")]
        public int MonetaryFundId { get; set; }

        [Required(ErrorMessage = "El monto es requerido")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor a 0")]
        public decimal Amount { get; set; }

        [MaxLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
        public string? Description { get; set; }
    }
}
