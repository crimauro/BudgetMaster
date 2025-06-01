using BudgetMaster.Application.DTOs.ExpenseTypes;
using FluentValidation;

namespace BudgetMaster.Application.Validators
{
    public class CreateExpenseTypeDtoValidator : AbstractValidator<CreateExpenseTypeDto>
    {
        public CreateExpenseTypeDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("El nombre del tipo de gasto es obligatorio")
                .Length(2, 100).WithMessage("El nombre debe tener entre 2 y 100 caracteres");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("La descripción no puede exceder 500 caracteres");
        }
    }

    public class UpdateExpenseTypeDtoValidator : AbstractValidator<UpdateExpenseTypeDto>
    {
        public UpdateExpenseTypeDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("El nombre del tipo de gasto es obligatorio")
                .Length(2, 100).WithMessage("El nombre debe tener entre 2 y 100 caracteres");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("La descripción no puede exceder 500 caracteres");
        }
    }
}
