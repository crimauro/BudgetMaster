using BudgetMaster.Application.DTOs.ExpenseTypes;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.Application.Services
{
    public interface IExpenseTypeService
    {
        Task<Result<IEnumerable<ExpenseTypeDto>>> GetAllAsync();
        Task<Result<ExpenseTypeDto>> GetByIdAsync(int id);
        Task<Result<ExpenseTypeDto>> CreateAsync(CreateExpenseTypeDto createDto);
        Task<Result<ExpenseTypeDto>> UpdateAsync(UpdateExpenseTypeDto updateDto);
        Task<Result> DeleteAsync(int id);
        Task<Result<string>> GetNextCodeAsync();
    }
}
