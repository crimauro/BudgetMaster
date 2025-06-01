using Microsoft.EntityFrameworkCore;
using BudgetMaster.Domain.Entities;
using BudgetMaster.Domain.Interfaces;
using BudgetMaster.Infrastructure.Data;

namespace BudgetMaster.Infrastructure.Repositories
{
    public class BudgetRepository : Repository<Budget>, IBudgetRepository
    {
        public BudgetRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Budget>> GetByUserIdAsync(int userId)
        {
            return await _dbSet
                .Where(b => b.UserId == userId && b.IsActive)
                .Include(b => b.ExpenseType)
                .ToListAsync();
        }

        public async Task<IEnumerable<Budget>> GetByExpenseTypeIdAsync(int expenseTypeId)
        {
            return await _dbSet
                .Where(b => b.ExpenseTypeId == expenseTypeId && b.IsActive)
                .Include(b => b.User)
                .Include(b => b.ExpenseType)
                .ToListAsync();
        }

        public async Task<IEnumerable<Budget>> GetByPeriodAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Where(b => b.IsActive && 
                           ((b.StartDate >= startDate && b.StartDate <= endDate) ||
                            (b.EndDate >= startDate && b.EndDate <= endDate) ||
                            (b.StartDate <= startDate && b.EndDate >= endDate)))
                .Include(b => b.User)
                .Include(b => b.ExpenseType)
                .ToListAsync();
        }

        public async Task<Budget?> GetByUserAndExpenseTypeAndPeriodAsync(int userId, int expenseTypeId, int month, int year)
        {
            return await _dbSet
                .FirstOrDefaultAsync(b => b.UserId == userId && 
                                         b.ExpenseTypeId == expenseTypeId && 
                                         b.Month == month && 
                                         b.Year == year && 
                                         b.IsActive);
        }

        public async Task<IEnumerable<Budget>> GetByMonthAndYearAsync(int month, int year)
        {
            return await _dbSet
                .Where(b => b.Month == month && b.Year == year && b.IsActive)
                .Include(b => b.User)
                .Include(b => b.ExpenseType)
                .ToListAsync();
        }        public async Task<bool> ExistsForUserExpenseTypeAndPeriodAsync(int userId, int expenseTypeId, int month, int year)
        {
            return await _dbSet.AnyAsync(b => b.UserId == userId && 
                                             b.ExpenseTypeId == expenseTypeId && 
                                             b.Month == month && 
                                             b.Year == year && 
                                             b.IsActive);
        }

        public async Task<Budget?> GetByUserExpenseTypeAndMonthAsync(int userId, int expenseTypeId, int month, int year)
        {
            return await GetByUserAndExpenseTypeAndPeriodAsync(userId, expenseTypeId, month, year);
        }

        public async Task<IEnumerable<Budget>> GetByUserAndMonthAsync(int userId, int month, int year)
        {
            return await _dbSet
                .Where(b => b.UserId == userId && b.Month == month && b.Year == year && b.IsActive)
                .Include(b => b.ExpenseType)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalBudgetByExpenseTypeAsync(int expenseTypeId, int month, int year)
        {
            return await _dbSet
                .Where(b => b.ExpenseTypeId == expenseTypeId && b.Month == month && b.Year == year && b.IsActive)
                .SumAsync(b => b.Amount);
        }

        public async Task<decimal> GetBudgetAmountByExpenseTypeAndMonthAsync(int expenseTypeId, int month, int year)
        {
            return await GetTotalBudgetByExpenseTypeAsync(expenseTypeId, month, year);
        }

        public async Task<bool> ExistsBudgetForUserExpenseTypeAndMonthAsync(int userId, int expenseTypeId, int month, int year)
        {
            return await ExistsForUserExpenseTypeAndPeriodAsync(userId, expenseTypeId, month, year);
        }
    }
}
