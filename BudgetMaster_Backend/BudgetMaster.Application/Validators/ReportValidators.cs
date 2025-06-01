using BudgetMaster.Application.DTOs.Reports;
using FluentValidation;

namespace BudgetMaster.Application.Validators
{
    public class MovementQueryFilterDtoValidator : AbstractValidator<MovementQueryFilterDto>
    {
        public MovementQueryFilterDtoValidator()
        {
            RuleFor(x => x.StartDate)
                .LessThanOrEqualTo(x => x.EndDate)
                .WithMessage("La fecha de inicio debe ser anterior o igual a la fecha de fin")
                .When(x => x.StartDate.HasValue && x.EndDate.HasValue);

            RuleFor(x => x.EndDate)
                .LessThanOrEqualTo(DateTime.Today)
                .WithMessage("La fecha de fin no puede ser futura")
                .When(x => x.EndDate.HasValue);

            RuleFor(x => x.StartDate)
                .LessThanOrEqualTo(DateTime.Today)
                .WithMessage("La fecha de inicio no puede ser futura")
                .When(x => x.StartDate.HasValue);

            RuleFor(x => x.MinAmount)
                .GreaterThanOrEqualTo(0)
                .WithMessage("El monto mínimo debe ser mayor o igual a cero")
                .When(x => x.MinAmount.HasValue);

            RuleFor(x => x.MaxAmount)
                .GreaterThanOrEqualTo(x => x.MinAmount)
                .WithMessage("El monto máximo debe ser mayor o igual al monto mínimo")
                .When(x => x.MaxAmount.HasValue && x.MinAmount.HasValue);

            RuleFor(x => x.MaxAmount)
                .GreaterThan(0)
                .WithMessage("El monto máximo debe ser mayor a cero")
                .When(x => x.MaxAmount.HasValue);

            RuleFor(x => x.MonetaryFundId)
                .GreaterThan(0)
                .WithMessage("El ID del fondo monetario debe ser válido")
                .When(x => x.MonetaryFundId.HasValue);

            RuleFor(x => x.ExpenseTypeId)
                .GreaterThan(0)
                .WithMessage("El ID del tipo de gasto debe ser válido")
                .When(x => x.ExpenseTypeId.HasValue);
        }
    }
}
