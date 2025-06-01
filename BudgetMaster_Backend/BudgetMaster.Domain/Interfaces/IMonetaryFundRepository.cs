using BudgetMaster.Domain.Entities;

namespace BudgetMaster.Domain.Interfaces
{
    public interface IMonetaryFundRepository : IRepository<MonetaryFund>
    {
        Task UpdateBalanceAsync(int fundId, decimal amount);
        Task<decimal> GetBalanceAsync(int fundId);
    }
}
