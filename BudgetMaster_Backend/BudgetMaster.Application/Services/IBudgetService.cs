using BudgetMaster.Application.DTOs.Budgets;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.Application.Services
{    public interface IBudgetService
    {
        Task<Result<IEnumerable<BudgetDto>>> GetAllAsync();
        Task<Result<BudgetDto>> GetByIdAsync(int id);
        Task<Result<IEnumerable<BudgetDto>>> GetByUserIdAsync(int userId);
        Task<Result<IEnumerable<BudgetDto>>> GetByUserAndMonthAsync(int userId, int month, int year);
        Task<Result<IEnumerable<BudgetDto>>> GetByExpenseTypeIdAsync(int expenseTypeId);
        Task<Result<IEnumerable<BudgetDto>>> GetByPeriodAsync(DateTime startDate, DateTime endDate);
        Task<Result<BudgetDto>> CreateAsync(CreateBudgetDto createDto);
        Task<Result<BudgetDto>> UpdateAsync(int id, UpdateBudgetDto updateDto);
        Task<Result<bool>> DeleteAsync(int id);
        Task<Result<decimal>> GetExecutedAmountAsync(int budgetId);
    }
}
