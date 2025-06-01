using BudgetMaster.Domain.Entities;

namespace BudgetMaster.Domain.Interfaces
{    public interface IBudgetRepository : IRepository<Budget>
    {
        Task<Budget?> GetByUserExpenseTypeAndMonthAsync(int userId, int expenseTypeId, int month, int year);
        Task<IEnumerable<Budget>> GetByUserIdAsync(int userId);
        Task<IEnumerable<Budget>> GetByUserAndMonthAsync(int userId, int month, int year);
        Task<decimal> GetTotalBudgetByExpenseTypeAsync(int expenseTypeId, int month, int year);
        Task<decimal> GetBudgetAmountByExpenseTypeAndMonthAsync(int expenseTypeId, int month, int year);
        Task<bool> ExistsBudgetForUserExpenseTypeAndMonthAsync(int userId, int expenseTypeId, int month, int year);
        Task<IEnumerable<Budget>> GetByExpenseTypeIdAsync(int expenseTypeId);
        Task<IEnumerable<Budget>> GetByPeriodAsync(DateTime startDate, DateTime endDate);
    }
}
