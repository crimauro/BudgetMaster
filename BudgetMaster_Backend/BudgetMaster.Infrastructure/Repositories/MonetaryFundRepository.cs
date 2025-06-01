using Microsoft.EntityFrameworkCore;
using BudgetMaster.Domain.Entities;
using BudgetMaster.Domain.Interfaces;
using BudgetMaster.Infrastructure.Data;

namespace BudgetMaster.Infrastructure.Repositories
{
    public class MonetaryFundRepository : Repository<MonetaryFund>, IMonetaryFundRepository
    {
        public MonetaryFundRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<bool> ExistsByNameAsync(string name)
        {
            return await _dbSet.AnyAsync(mf => mf.Name == name && mf.IsActive);
        }

        public async Task<MonetaryFund?> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(mf => mf.Name == name && mf.IsActive);
        }

        public async Task<decimal> GetCurrentBalanceAsync(int monetaryFundId)
        {
            var fund = await GetByIdAsync(monetaryFundId);
            if (fund == null) return 0;

            // Calcular balance actual: balance inicial + depósitos - gastos
            var deposits = await _context.Deposits
                .Where(d => d.MonetaryFundId == monetaryFundId && d.IsActive)
                .SumAsync(d => d.Amount);

            var expenses = await _context.ExpenseRecords
                .Where(er => er.MonetaryFundId == monetaryFundId && er.IsActive)
                .SumAsync(er => er.Amount);

            return fund.InitialBalance + deposits - expenses;
        }

        public async Task UpdateBalanceAsync(int monetaryFundId, decimal amount)
        {
            var fund = await GetByIdAsync(monetaryFundId);
            if (fund != null)
            {
                fund.Balance = amount;
                Update(fund);
            }
        }

        public async Task<decimal> GetBalanceAsync(int monetaryFundId)
        {
            return await GetCurrentBalanceAsync(monetaryFundId);
        }
    }
}
