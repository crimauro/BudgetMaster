using Microsoft.EntityFrameworkCore;
using BudgetMaster.Domain.Entities;
using BudgetMaster.Domain.Interfaces;
using BudgetMaster.Infrastructure.Data;

namespace BudgetMaster.Infrastructure.Repositories
{    public class DepositRepository : Repository<Deposit>, IDepositRepository
    {
        public DepositRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Deposit>> GetByUserIdAsync(int userId)
        {
            return await _dbSet
                .Where(d => d.UserId == userId && d.IsActive)
                .Include(d => d.MonetaryFund)
                .Include(d => d.User)
                .OrderByDescending(d => d.Date)
                .ToListAsync();
        }

        public async Task<IEnumerable<Deposit>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Where(d => d.Date >= startDate && d.Date <= endDate && d.IsActive)
                .Include(d => d.MonetaryFund)
                .OrderByDescending(d => d.Date)
                .ToListAsync();
        }

        public async Task<IEnumerable<Deposit>> GetByMonetaryFundAsync(int monetaryFundId)
        {
            return await _dbSet
                .Where(d => d.MonetaryFundId == monetaryFundId && d.IsActive)
                .Include(d => d.MonetaryFund)
                .OrderByDescending(d => d.Date)
                .ToListAsync();
        }

        public async Task<IEnumerable<Deposit>> GetByMonetaryFundIdAsync(int monetaryFundId)
        {
            return await GetByMonetaryFundAsync(monetaryFundId);
        }

        public async Task<IEnumerable<Deposit>> GetByPeriodAsync(DateTime startDate, DateTime endDate)
        {
            return await GetByDateRangeAsync(startDate, endDate);
        }

        public async Task<IEnumerable<Deposit>> GetByMonetaryFundAndPeriodAsync(int monetaryFundId, DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Where(d => d.MonetaryFundId == monetaryFundId && 
                           d.Date >= startDate && 
                           d.Date <= endDate && 
                           d.IsActive)
                .Include(d => d.MonetaryFund)
                .OrderByDescending(d => d.Date)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalDepositsByFundAndDateAsync(int monetaryFundId, DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Where(d => d.MonetaryFundId == monetaryFundId && 
                           d.Date >= startDate && 
                           d.Date <= endDate && 
                           d.IsActive)
                .SumAsync(d => d.Amount);
        }

        public async Task<bool> HasDepositsForFundAsync(int monetaryFundId)
        {
            return await _dbSet.AnyAsync(d => d.MonetaryFundId == monetaryFundId && d.IsActive);
        }
    }
}
