using BudgetMaster.Domain.Entities;

namespace BudgetMaster.Domain.Interfaces
{
    public interface IExpenseTypeRepository : IRepository<ExpenseType>
    {
        Task<string> GetNextCodeAsync();
        Task<bool> CodeExistsAsync(string code);
    }
}
