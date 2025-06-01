using BudgetMaster.Application.DTOs.ExpenseRecords;
using BudgetMaster.Domain.Common;

namespace BudgetMaster.Application.Services
{    public interface IExpenseRecordService
    {
        Task<Result<IEnumerable<ExpenseRecordDto>>> GetAllAsync();
        Task<Result<ExpenseRecordDto>> GetByIdAsync(int id);
        Task<Result<IEnumerable<ExpenseRecordDto>>> GetByUserIdAsync(int userId);
        Task<Result<IEnumerable<ExpenseRecordDto>>> GetByExpenseTypeIdAsync(int expenseTypeId);
        Task<Result<IEnumerable<ExpenseRecordDto>>> GetByMonetaryFundIdAsync(int monetaryFundId);
        Task<Result<IEnumerable<ExpenseRecordDto>>> GetByPeriodAsync(DateTime startDate, DateTime endDate);
        Task<Result<IEnumerable<ExpenseRecordDto>>> GetByExpenseTypeAndPeriodAsync(int expenseTypeId, DateTime startDate, DateTime endDate);
        Task<Result<ExpenseRecordDto>> CreateAsync(CreateExpenseRecordDto createDto);
        Task<Result<ExpenseRecordDto>> UpdateAsync(int id, UpdateExpenseRecordDto updateDto);
        Task<Result<bool>> DeleteAsync(int id);
        Task<Result<IEnumerable<ExpenseDetailDto>>> GetExpenseDetailsAsync(int expenseRecordId);
        Task<Result<ExpenseDetailDto>> AddExpenseDetailAsync(int expenseRecordId, CreateExpenseDetailDto createDto);
        Task<Result<bool>> RemoveExpenseDetailAsync(int expenseDetailId);
    }
}
