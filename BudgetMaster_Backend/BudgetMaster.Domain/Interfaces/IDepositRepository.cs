using BudgetMaster.Domain.Entities;

namespace BudgetMaster.Domain.Interfaces
{    public interface IDepositRepository : IRepository<Deposit>
    {
        Task<IEnumerable<Deposit>> GetByUserIdAsync(int userId);
        Task<IEnumerable<Deposit>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Deposit>> GetByMonetaryFundAsync(int monetaryFundId);
        Task<IEnumerable<Deposit>> GetByMonetaryFundIdAsync(int monetaryFundId);
        Task<IEnumerable<Deposit>> GetByPeriodAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Deposit>> GetByMonetaryFundAndPeriodAsync(int monetaryFundId, DateTime startDate, DateTime endDate);
        Task<decimal> GetTotalDepositsByFundAndDateAsync(int monetaryFundId, DateTime startDate, DateTime endDate);
        Task<bool> HasDepositsForFundAsync(int monetaryFundId);
    }
}
