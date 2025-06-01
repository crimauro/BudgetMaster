using BudgetMaster.Domain.Entities;

namespace BudgetMaster.Domain.Interfaces
{    public interface IExpenseRecordRepository : IRepository<ExpenseRecord>
    {
        Task<IEnumerable<ExpenseRecord>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<ExpenseRecord>> GetByUserIdAsync(int userId);
        Task<IEnumerable<ExpenseRecord>> GetByMonetaryFundAsync(int monetaryFundId);
        Task<IEnumerable<ExpenseRecord>> GetByExpenseTypeIdAsync(int expenseTypeId);
        Task<IEnumerable<ExpenseRecord>> GetByMonetaryFundIdAsync(int monetaryFundId);
        Task<IEnumerable<ExpenseRecord>> GetByPeriodAsync(DateTime startDate, DateTime endDate);
        Task<decimal> GetTotalExpensesByTypeAndDateAsync(int expenseTypeId, DateTime startDate, DateTime endDate);
        Task<ExpenseRecord?> GetWithDetailsAsync(int id);
        Task<IEnumerable<ExpenseRecord>> GetByExpenseTypeAndPeriodAsync(int expenseTypeId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<ExpenseDetail>> GetExpenseDetailsAsync(int expenseRecordId);
        Task<ExpenseDetail> AddExpenseDetailAsync(ExpenseDetail expenseDetail);
        Task<ExpenseDetail?> GetExpenseDetailByIdAsync(int expenseDetailId);
        Task DeleteExpenseDetail(ExpenseDetail expenseDetail);        Task<bool> HasExpenseRecordsForFundAsync(int monetaryFundId);
    }
}
