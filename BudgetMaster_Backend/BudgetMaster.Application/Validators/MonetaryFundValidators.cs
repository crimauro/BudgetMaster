using BudgetMaster.Application.DTOs.MonetaryFunds;
using FluentValidation;

namespace BudgetMaster.Application.Validators
{
    public class CreateMonetaryFundDtoValidator : AbstractValidator<CreateMonetaryFundDto>
    {
        public CreateMonetaryFundDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("El nombre del fondo monetario es obligatorio")
                .Length(2, 100).WithMessage("El nombre debe tener entre 2 y 100 caracteres");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("La descripción no puede exceder 500 caracteres");
        }
    }

    public class UpdateMonetaryFundDtoValidator : AbstractValidator<UpdateMonetaryFundDto>
    {
        public UpdateMonetaryFundDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("El nombre del fondo monetario es obligatorio")
                .Length(2, 100).WithMessage("El nombre debe tener entre 2 y 100 caracteres");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("La descripción no puede exceder 500 caracteres");
        }
    }
}
