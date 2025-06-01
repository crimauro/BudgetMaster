using AutoMapper;
using BudgetMaster.Application.DTOs.Budgets;
using BudgetMaster.Domain.Entities;
using BudgetMaster.Domain.Interfaces;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.Application.Services
{
    public class BudgetService : IBudgetService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public BudgetService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<IEnumerable<BudgetDto>>> GetAllAsync()
        {
            try
            {
                var budgets = await _unitOfWork.Budgets.GetAllAsync();
                var budgetDtos = _mapper.Map<IEnumerable<BudgetDto>>(budgets);
                return Result<IEnumerable<BudgetDto>>.Success(budgetDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<BudgetDto>>.Failure($"Error al obtener los presupuestos: {ex.Message}");
            }
        }

        public async Task<Result<BudgetDto>> GetByIdAsync(int id)
        {
            try
            {
                var budget = await _unitOfWork.Budgets.GetByIdAsync(id);
                if (budget == null)
                    return Result<BudgetDto>.Failure("Presupuesto no encontrado");

                var budgetDto = _mapper.Map<BudgetDto>(budget);
                return Result<BudgetDto>.Success(budgetDto);
            }
            catch (Exception ex)
            {
                return Result<BudgetDto>.Failure($"Error al obtener el presupuesto: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<BudgetDto>>> GetByExpenseTypeIdAsync(int expenseTypeId)
        {
            try
            {
                var budgets = await _unitOfWork.Budgets.GetByExpenseTypeIdAsync(expenseTypeId);
                var budgetDtos = _mapper.Map<IEnumerable<BudgetDto>>(budgets);
                return Result<IEnumerable<BudgetDto>>.Success(budgetDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<BudgetDto>>.Failure($"Error al obtener los presupuestos por tipo de gasto: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<BudgetDto>>> GetByPeriodAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                var budgets = await _unitOfWork.Budgets.GetByPeriodAsync(startDate, endDate);
                var budgetDtos = _mapper.Map<IEnumerable<BudgetDto>>(budgets);
                return Result<IEnumerable<BudgetDto>>.Success(budgetDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<BudgetDto>>.Failure($"Error al obtener los presupuestos por período: {ex.Message}");
            }
        }

        public async Task<Result<BudgetDto>> CreateAsync(CreateBudgetDto createDto)
        {
            try
            {
                // Extraer Month y Year de la fecha de inicio si no se proporcionaron
                if (createDto.Month <= 0 || createDto.Month > 12)
                    createDto.Month = createDto.StartDate.Month;

                if (createDto.Year < 2020 || createDto.Year > 2050)
                    createDto.Year = createDto.StartDate.Year;

                var budget = _mapper.Map<Budget>(createDto);
                await _unitOfWork.Budgets.AddAsync(budget);
                await _unitOfWork.CompleteAsync();

                var budgetDto = _mapper.Map<BudgetDto>(budget);
                return Result<BudgetDto>.Success(budgetDto);
            }
            catch (Exception ex)
            {
                return Result<BudgetDto>.Failure($"Error al crear el presupuesto: {ex.Message}");
            }
        }

        public async Task<Result<BudgetDto>> UpdateAsync(int id, UpdateBudgetDto updateDto)
        {
            try
            {
                var budget = await _unitOfWork.Budgets.GetByIdAsync(id);
                if (budget == null)
                    return Result<BudgetDto>.Failure("Presupuesto no encontrado");

                // Actualizar solo las propiedades necesarias manualmente
                budget.Amount = updateDto.Amount;
                budget.Description = updateDto.Description;
                budget.Month = updateDto.Month;
                budget.Year = updateDto.Year;
                budget.ModifiedDate = DateTime.UtcNow;

                // Si tienes las fechas en el DTO y quieres actualizarlas
                if (updateDto.StartDate != default)
                    budget.StartDate = updateDto.StartDate;
                if (updateDto.EndDate != default)
                    budget.EndDate = updateDto.EndDate;

                await _unitOfWork.Budgets.UpdateAsync(budget);
                await _unitOfWork.CompleteAsync();

                var budgetDto = _mapper.Map<BudgetDto>(budget);
                return Result<BudgetDto>.Success(budgetDto);
            }
            catch (Exception ex)
            {
                return Result<BudgetDto>.Failure($"Error al actualizar el presupuesto: {ex.Message}");
            }
        }

        public async Task<Result<bool>> DeleteAsync(int id)
        {
            try
            {
                var budget = await _unitOfWork.Budgets.GetByIdAsync(id);
                if (budget == null)
                    return Result<bool>.Failure("Presupuesto no encontrado");

                await _unitOfWork.Budgets.DeleteAsync(budget);
                await _unitOfWork.CompleteAsync();

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure($"Error al eliminar el presupuesto: {ex.Message}");
            }
        }

        public async Task<Result<decimal>> GetExecutedAmountAsync(int id)
        {
            try
            {
                var budget = await _unitOfWork.Budgets.GetByIdAsync(id);
                if (budget == null)
                    return Result<decimal>.Failure("Presupuesto no encontrado");

                var expenseRecords = await _unitOfWork.ExpenseRecords.GetByExpenseTypeAndPeriodAsync(
                    budget.ExpenseTypeId, budget.StartDate, budget.EndDate);

                var executedAmount = expenseRecords.Sum(e => e.TotalAmount);
                return Result<decimal>.Success(executedAmount);
            }
            catch (Exception ex)
            {
                return Result<decimal>.Failure($"Error al calcular el monto ejecutado: {ex.Message}");
            }
        }

        public async Task<Result<decimal>> GetRemainingAmountAsync(int id)
        {
            try
            {
                var budget = await _unitOfWork.Budgets.GetByIdAsync(id);
                if (budget == null)
                    return Result<decimal>.Failure("Presupuesto no encontrado");

                var executedResult = await GetExecutedAmountAsync(id);
                if (!executedResult.IsSuccess)
                    return Result<decimal>.Failure(executedResult.Error);

                var remainingAmount = budget.Amount - executedResult.Data!;
                return Result<decimal>.Success(remainingAmount);
            }
            catch (Exception ex)
            {
                return Result<decimal>.Failure($"Error al calcular el monto restante: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<BudgetDto>>> GetByUserIdAsync(int userId)
        {
            try
            {
                var budgets = await _unitOfWork.Budgets.GetByUserIdAsync(userId);
                var budgetDtos = _mapper.Map<IEnumerable<BudgetDto>>(budgets);
                return Result<IEnumerable<BudgetDto>>.Success(budgetDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<BudgetDto>>.Failure($"Error al obtener los presupuestos del usuario: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<BudgetDto>>> GetByUserAndMonthAsync(int userId, int month, int year)
        {
            try
            {
                var budgets = await _unitOfWork.Budgets.GetByUserAndMonthAsync(userId, month, year);
                var budgetDtos = _mapper.Map<IEnumerable<BudgetDto>>(budgets);
                return Result<IEnumerable<BudgetDto>>.Success(budgetDtos);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<BudgetDto>>.Failure($"Error al obtener los presupuestos del usuario por mes: {ex.Message}");
            }
        }
    }
}
