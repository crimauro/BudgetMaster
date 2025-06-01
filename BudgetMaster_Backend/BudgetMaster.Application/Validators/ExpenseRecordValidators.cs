using BudgetMaster.Application.DTOs.ExpenseRecords;
using FluentValidation;

namespace BudgetMaster.Application.Validators
{
    public class CreateExpenseRecordDtoValidator : AbstractValidator<CreateExpenseRecordDto>
    {
        public CreateExpenseRecordDtoValidator()
        {
            RuleFor(x => x.ExpenseTypeId)
                .GreaterThan(0).WithMessage("Debe seleccionar un tipo de gasto válido");

            RuleFor(x => x.MonetaryFundId)
                .GreaterThan(0).WithMessage("Debe seleccionar un fondo monetario válido");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("El monto del gasto debe ser mayor a cero")
                .LessThanOrEqualTo(999999999.99m).WithMessage("El monto no puede exceder $999,999,999.99");

            RuleFor(x => x.Date)
                .NotEmpty().WithMessage("La fecha del gasto es obligatoria")
                .LessThanOrEqualTo(DateTime.Today).WithMessage("La fecha no puede ser futura");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("La descripción del gasto es obligatoria")
                .Length(5, 500).WithMessage("La descripción debe tener entre 5 y 500 caracteres");

            RuleForEach(x => x.ExpenseDetails)
                .SetValidator(new CreateExpenseDetailDtoValidator())
                .When(x => x.ExpenseDetails != null);
        }
    }

    public class UpdateExpenseRecordDtoValidator : AbstractValidator<UpdateExpenseRecordDto>
    {
        public UpdateExpenseRecordDtoValidator()
        {
            RuleFor(x => x.ExpenseTypeId)
                .GreaterThan(0).WithMessage("Debe seleccionar un tipo de gasto válido");

            RuleFor(x => x.MonetaryFundId)
                .GreaterThan(0).WithMessage("Debe seleccionar un fondo monetario válido");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("El monto del gasto debe ser mayor a cero")
                .LessThanOrEqualTo(999999999.99m).WithMessage("El monto no puede exceder $999,999,999.99");

            RuleFor(x => x.Date)
                .NotEmpty().WithMessage("La fecha del gasto es obligatoria")
                .LessThanOrEqualTo(DateTime.Today).WithMessage("La fecha no puede ser futura");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("La descripción del gasto es obligatoria")
                .Length(5, 500).WithMessage("La descripción debe tener entre 5 y 500 caracteres");
        }
    }

    public class CreateExpenseDetailDtoValidator : AbstractValidator<CreateExpenseDetailDto>
    {
        public CreateExpenseDetailDtoValidator()
        {
            RuleFor(x => x.ItemName)
                .NotEmpty().WithMessage("El nombre del ítem es obligatorio")
                .Length(2, 200).WithMessage("El nombre del ítem debe tener entre 2 y 200 caracteres");

            RuleFor(x => x.Quantity)
                .GreaterThan(0).WithMessage("La cantidad debe ser mayor a cero")
                .LessThanOrEqualTo(999999).WithMessage("La cantidad no puede exceder 999,999");

            RuleFor(x => x.UnitPrice)
                .GreaterThan(0).WithMessage("El precio unitario debe ser mayor a cero")
                .LessThanOrEqualTo(999999999.99m).WithMessage("El precio unitario no puede exceder $999,999,999.99");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("La descripción no puede exceder 500 caracteres");
        }
    }
}
