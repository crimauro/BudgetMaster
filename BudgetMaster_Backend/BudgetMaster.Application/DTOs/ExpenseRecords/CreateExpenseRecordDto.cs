using System.ComponentModel.DataAnnotations;
using BudgetMaster.Domain.Enums;

namespace BudgetMaster.Application.DTOs.ExpenseRecords
{
    public class CreateExpenseRecordDto
    {
        [Required(ErrorMessage = "El usuario es requerido")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "La fecha es requerida")]
        public DateTime Date { get; set; }

        [Required(ErrorMessage = "El fondo monetario es requerido")]
        public int MonetaryFundId { get; set; }

        [Required(ErrorMessage = "El tipo de gasto es requerido")]
        public int ExpenseTypeId { get; set; }

        [Required(ErrorMessage = "El monto es requerido")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor a 0")]
        public decimal Amount { get; set; }

        [MaxLength(500, ErrorMessage = "Las observaciones no pueden exceder 500 caracteres")]
        public string? Observations { get; set; }

        [MaxLength(200, ErrorMessage = "El nombre del comercio no puede exceder 200 caracteres")]
        public string? StoreName { get; set; }

        [Required(ErrorMessage = "El tipo de documento es requerido")]
        public DocumentType DocumentType { get; set; }

        [MaxLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Debe incluir al menos un detalle de gasto")]
        [MinLength(1, ErrorMessage = "Debe incluir al menos un detalle de gasto")]
        public List<CreateExpenseDetailDto> ExpenseDetails { get; set; } = new List<CreateExpenseDetailDto>();
    }

    public class CreateExpenseDetailDto
    {
        [Required(ErrorMessage = "El tipo de gasto es requerido")]
        public int ExpenseTypeId { get; set; }

        [Required(ErrorMessage = "El nombre del artículo es requerido")]
        [MaxLength(200, ErrorMessage = "El nombre del artículo no puede exceder 200 caracteres")]
        public string ItemName { get; set; } = string.Empty;

        [Required(ErrorMessage = "La cantidad es requerida")]
        [Range(0.01, double.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
        public decimal Quantity { get; set; }

        [Required(ErrorMessage = "El precio unitario es requerido")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio unitario debe ser mayor a 0")]
        public decimal UnitPrice { get; set; }        [Required(ErrorMessage = "El monto es requerido")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor a 0")]
        public decimal Amount { get; set; }

        [MaxLength(200, ErrorMessage = "La descripción no puede exceder 200 caracteres")]
        public string? Description { get; set; }
    }
}
