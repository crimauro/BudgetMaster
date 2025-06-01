using BudgetMaster.Application.DTOs.Budgets;
using FluentValidation;

namespace BudgetMaster.Application.Validators
{
    public class CreateBudgetDtoValidator : AbstractValidator<CreateBudgetDto>
    {
        public CreateBudgetDtoValidator()
        {
            RuleFor(x => x.ExpenseTypeId)
                .GreaterThan(0).WithMessage("Debe seleccionar un tipo de gasto válido");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("El monto del presupuesto debe ser mayor a cero")
                .LessThanOrEqualTo(999999999.99m).WithMessage("El monto no puede exceder $999,999,999.99");

            RuleFor(x => x.StartDate)
                .NotEmpty().WithMessage("La fecha de inicio es obligatoria");

            RuleFor(x => x.EndDate)
                .NotEmpty().WithMessage("La fecha de fin es obligatoria")
                .GreaterThan(x => x.StartDate).WithMessage("La fecha de fin debe ser posterior a la fecha de inicio");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("La descripción no puede exceder 500 caracteres");
        }
    }

    public class UpdateBudgetDtoValidator : AbstractValidator<UpdateBudgetDto>
    {
        public UpdateBudgetDtoValidator()
        {
            RuleFor(x => x.ExpenseTypeId)
                .GreaterThan(0).WithMessage("Debe seleccionar un tipo de gasto válido");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("El monto del presupuesto debe ser mayor a cero")
                .LessThanOrEqualTo(999999999.99m).WithMessage("El monto no puede exceder $999,999,999.99");

            RuleFor(x => x.StartDate)
                .NotEmpty().WithMessage("La fecha de inicio es obligatoria");

            RuleFor(x => x.EndDate)
                .NotEmpty().WithMessage("La fecha de fin es obligatoria")
                .GreaterThan(x => x.StartDate).WithMessage("La fecha de fin debe ser posterior a la fecha de inicio");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("La descripción no puede exceder 500 caracteres");
        }
    }
}
