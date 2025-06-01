using BudgetMaster.Application.DTOs.Deposits;
using FluentValidation;

namespace BudgetMaster.Application.Validators
{
    public class CreateDepositDtoValidator : AbstractValidator<CreateDepositDto>
    {
        public CreateDepositDtoValidator()
        {
            RuleFor(x => x.MonetaryFundId)
                .GreaterThan(0).WithMessage("Debe seleccionar un fondo monetario válido");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("El monto del depósito debe ser mayor a cero")
                .LessThanOrEqualTo(999999999.99m).WithMessage("El monto no puede exceder $999,999,999.99");

            RuleFor(x => x.Date)
                .NotEmpty().WithMessage("La fecha del depósito es obligatoria")
                .LessThanOrEqualTo(DateTime.Today).WithMessage("La fecha no puede ser futura");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("La descripción del depósito es obligatoria")
                .Length(5, 500).WithMessage("La descripción debe tener entre 5 y 500 caracteres");
        }
    }

    public class UpdateDepositDtoValidator : AbstractValidator<UpdateDepositDto>
    {
        public UpdateDepositDtoValidator()
        {
            RuleFor(x => x.MonetaryFundId)
                .GreaterThan(0).WithMessage("Debe seleccionar un fondo monetario válido");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("El monto del depósito debe ser mayor a cero")
                .LessThanOrEqualTo(999999999.99m).WithMessage("El monto no puede exceder $999,999,999.99");

            RuleFor(x => x.Date)
                .NotEmpty().WithMessage("La fecha del depósito es obligatoria")
                .LessThanOrEqualTo(DateTime.Today).WithMessage("La fecha no puede ser futura");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("La descripción del depósito es obligatoria")
                .Length(5, 500).WithMessage("La descripción debe tener entre 5 y 500 caracteres");
        }
    }
}
